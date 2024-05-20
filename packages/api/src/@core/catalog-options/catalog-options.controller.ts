import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import {
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CatalogOptionsService } from './catalog-options.service';
import { CreateCatalogOptionsDto } from './dto/catalog-options.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';


@ApiTags('catalog-options')
@Controller('catalog-options')
export class CatalogOptionsController {
    constructor(
        private readonly catalogOptionsService: CatalogOptionsService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(CatalogOptionsController.name);
    }

    @ApiOperation({ operationId: 'CreateCatalogOptions', summary: 'Add or Update Catalog' })
    @ApiBody({ type: CreateCatalogOptionsDto })
    @ApiResponse({ status: 201 })
    @UseGuards(JwtAuthGuard)
    @Post()
    addCatalogOptions(@Body() catalogOptionsDto: CreateCatalogOptionsDto) {
        return this.catalogOptionsService.createCatalogOptions(catalogOptionsDto);
    }


    // It should be public API and don't have to add AuthGuard
    @ApiOperation({
        operationId: 'getCatalog',
        summary: 'Retrieve a Catalog Options by Project ID',
    })
    @ApiQuery({ name: 'projectID', required: true, type: String })
    @ApiResponse({ status: 200 })
    @Get('single')
    getLinkedUser(@Query('projectID') id: string) {
        // validate project_id against user
        return this.catalogOptionsService.getCatalogByProjectId(id);
    }

    @ApiOperation({
        operationId: 'getCatalog',
        summary: 'Retrieve a Catalog Options by User ID',
    })
    @ApiQuery({ name: 'userID', required: true, type: String })
    @ApiResponse({ status: 200 })
    @UseGuards(JwtAuthGuard)
    @Get('single')
    getLinkedUserV2(@Query('userID') id: string) {
        // validate project_id against user
        return this.catalogOptionsService.getCatalogByUserId(id);
    }

}