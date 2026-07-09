import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminJwtPayload } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminCategoryService } from './admin-category.service';
import { assertCanViewCategory, assertCanManageCategory } from './role.util';
import { parseAdminCategoryListQuery } from './dto/admin-category-query.dto';
import {
  parseAdminCategoryCreateBody,
  parseAdminCategoryUpdateBody,
  parseCategoryStatusUpdateBody,
} from './dto/admin-category-body.dto';
import { isLocale } from '@emoji-platform/types';

@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: AdminCategoryService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async list(
    @Query() query: Record<string, string | undefined>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewCategory(admin.role);
    const parsed = parseAdminCategoryListQuery(query);
    const result = await this.categoryService.list(parsed);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('tree')
  @UseGuards(AdminAuthGuard)
  async tree(
    @Query('locale') locale: string | undefined,
    @Query('exclude') exclude: string | undefined,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewCategory(admin.role);
    const safeLocale = locale && isLocale(locale) ? locale : 'zh';
    const result = await this.categoryService.tree(safeLocale, exclude);
    return {
      success: true,
      data: result.data,
    };
  }

  @Get('options')
  @UseGuards(AdminAuthGuard)
  async options(
    @Query('locale') locale: string | undefined,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanViewCategory(admin.role);
    const safeLocale = locale && isLocale(locale) ? locale : 'zh';
    const result = await this.categoryService.categoryOptions(safeLocale);
    return {
      success: true,
      data: result.data,
    };
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async detail(@Param('id') id: string, @CurrentAdmin() admin: AdminJwtPayload) {
    assertCanViewCategory(admin.role);
    const result = await this.categoryService.getById(id);
    return {
      success: true,
      data: result.data,
    };
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async create(
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageCategory(admin.role);
    const input = parseAdminCategoryCreateBody(body);
    const result = await this.categoryService.create(input, admin);
    return {
      success: true,
      data: result.data,
    };
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageCategory(admin.role);
    const input = parseAdminCategoryUpdateBody(body);
    const result = await this.categoryService.update(id, input, admin);
    return {
      success: true,
      data: result.data,
    };
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentAdmin() admin: AdminJwtPayload,
  ) {
    assertCanManageCategory(admin.role);
    const status = parseCategoryStatusUpdateBody(body);
    const result = await this.categoryService.setStatus(id, status, admin);
    return {
      success: true,
      data: result.data,
    };
  }
}
