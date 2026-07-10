import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminAssetService } from './admin-asset.service';
import { assertCanViewAsset, assertCanManageAsset } from './role.util';
import { parseAdminAssetListQuery } from './dto/admin-asset-query.dto';
import {
  parseAdminAssetCreateBody,
  parseAdminAssetUpdateBody,
  parseAssetStatusUpdateBody,
} from './dto/admin-asset-body.dto';

@Controller('admin/assets')
export class AdminAssetController {
  constructor(private readonly assetService: AdminAssetService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewAsset(admin.role);
    const parsed = parseAdminAssetListQuery(query);
    const result = await this.assetService.list(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('providers')
  @UseGuards(AdminAuthGuard)
  async providers(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewAsset(admin.role);
    const result = this.assetService.providers();
    return { success: true, data: result.data };
  }

  @Get('file-types')
  @UseGuards(AdminAuthGuard)
  async fileTypes(@CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewAsset(admin.role);
    const result = this.assetService.fileTypes();
    return { success: true, data: result.data };
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async detail(@Param('id') id: string, @CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewAsset(admin.role);
    const result = await this.assetService.getById(id);
    return { success: true, data: result.data };
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async create(
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageAsset(admin.role);
    const input = parseAdminAssetCreateBody(body);
    const result = await this.assetService.create(input, admin);
    return { success: true, data: result.data };
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageAsset(admin.role);
    const input = parseAdminAssetUpdateBody(body);
    const result = await this.assetService.update(id, input, admin);
    return { success: true, data: result.data };
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageAsset(admin.role);
    const status = parseAssetStatusUpdateBody(body);
    const result = await this.assetService.setStatus(id, status, admin);
    return { success: true, data: result.data };
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async remove(
    @Param('id') id: string,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageAsset(admin.role);
    const result = await this.assetService.delete(id, admin);
    return { success: true, data: result.data };
  }
}
