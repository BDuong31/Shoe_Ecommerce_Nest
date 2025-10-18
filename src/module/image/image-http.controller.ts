import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { IMAGE_REPOSITORY, IMAGE_SERVICE } from "./image.di-token";
import { IImageRepository, IImageService } from "./image.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester, UserRole } from "src/share";
import { CreateImageDTO, FilterImageDTO, filterImageDTOSchema } from "./image.model";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('v1/images')
export class ImageHttpController {
    constructor(
        @Inject(IMAGE_SERVICE) private readonly service: IImageService,
        @Inject(IMAGE_REPOSITORY) private readonly repo: IImageRepository,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('file')) // Thêm FileInterceptor để xử lý file, 'file' là tên field trong form-data
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createImage(@Body() dto: CreateImageDTO, @UploadedFile() file: Express.Multer.File){
        const data = await this.service.create(dto, file);
        return { data };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listImage(@Request() req: ReqWithRequester, @Query() dto: FilterImageDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = filterImageDTOSchema.parse(dto);
        const data = await this.repo.list(dto, paging);
        return paginatedResponse(data, dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getImage(@Param('id') id: string){
        const data = await this.repo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateImage(@Param('id') id: string,  @Body() dto: CreateImageDTO){
        const data = await this.service.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteImage(@Param('id') id: string){
        const data = await this.service.delete(id);
        return { data };
    }
}  