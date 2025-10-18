import { Inject, Injectable, BadRequestException, OnModuleInit, NotFoundException } from "@nestjs/common";
import { IImageRepository, IImageService } from "./image.port";
import { IMAGE_REPOSITORY } from "./image.di-token";
import { 
    CreateImageDTO, 
    createImageDTOSchema, 
    UpdateImageDTO, 
    updateImageDTOSchema,
    ErrImageNotFound 
} from "./image.model";
import { AppError } from "src/share";
import { v7 } from "uuid";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import prisma from "src/share/components/prisma"; 

@Injectable()
export class ImageService implements IImageService, OnModuleInit {
    private readonly prisma: PrismaClient = prisma; 

    constructor(
        @Inject(IMAGE_REPOSITORY) private readonly imageRepo: IImageRepository,
    ) {
        cloudinary.config(process.env.CLOUDINARY_URL || '');
    }

    onModuleInit() {
        if (!process.env.CLOUDINARY_URL) {
            console.warn("CLOUDINARY_URL is not set. Cloudinary operations will likely fail.");
        }
    }

    private fileToDataUri(file: Express.Multer.File): string {
        if (!file.buffer) {
            throw new BadRequestException("File buffer is missing. Check Multer setup.");
        }
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    async create(dto: CreateImageDTO, file: Express.Multer.File): Promise<string> {
        const data = createImageDTOSchema.parse(dto);
        let uploadResult: UploadApiResponse;

        if (!file) {
            throw new BadRequestException('File ảnh không được cung cấp.');
        }

        try {
            const fileUri = this.fileToDataUri(file);
            uploadResult = await cloudinary.uploader.upload(fileUri, {
                folder: `ecommerce/products/${data.productId}`, 
            });
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            throw new BadRequestException('Image upload failed to Cloudinary.');
        }

        const newId = v7();
        
        await this.prisma.$transaction(async (tx) => {
            
            if (data.isMain) {
                const existingMainImage = await tx.image.findFirst({
                    where: { productId: data.productId, isMain: true }
                });

                if (existingMainImage) {
                    await tx.image.update({
                        where: { id: existingMainImage.id },
                        data: { isMain: false }
                    });
                }
            }

            const newImage = {
                id: newId,
                url: uploadResult.secure_url,
                isMain: data.isMain,
                publicId: uploadResult.public_id,
                productId: data.productId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await this.imageRepo.insert(newImage); 
            
        });

        return newId;
    }

    async update(imageId: string, dto: UpdateImageDTO): Promise<boolean> {
        const data = updateImageDTOSchema.parse(dto);
        const imageExist = await this.imageRepo.get(imageId);

        if (!imageExist) {
            throw AppError.from(ErrImageNotFound, 404);
        }
        
        if (data.isMain === true) {
             await this.prisma.$transaction(async (tx) => {
                await tx.image.updateMany({
                    where: { productId: imageExist.productId, isMain: true },
                    data: { isMain: false },
                });

                const updatedImage = {
                    ...data,
                    updatedAt: new Date(),
                };
                await this.imageRepo.update(imageId, updatedImage);
            });
        } else {
             const updatedImage = {
                ...data,
                updatedAt: new Date(),
            };
            await this.imageRepo.update(imageId, updatedImage);
        }
       
        return true;
    }

    async delete(imageId: string): Promise<boolean> {
        const imageExist = await this.imageRepo.get(imageId);

        if (!imageExist) {
            throw AppError.from(ErrImageNotFound, 404);
        }

        if (imageExist.publicId) {
            try {
                await cloudinary.uploader.destroy(imageExist.publicId);
            } catch (e) {
                console.error(`Failed to delete Cloudinary file: ${imageExist.publicId}`);
            }
        }
        
        await this.prisma.$transaction(async (tx) => {
            
            await this.imageRepo.delete(imageId); 
            
            if (imageExist.isMain) {
                const nextMainCandidate = await tx.image.findFirst({
                    where: { productId: imageExist.productId },
                    orderBy: { createdAt: 'asc' }, 
                    take: 1,
                });

                if (nextMainCandidate) {
                    await tx.image.update({
                        where: { id: nextMainCandidate.id },
                        data: { isMain: true },
                    });
                }
            }
        });

        return true;
    }
}