import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll({ limit, page }: PaginationDto) {
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);
    return {
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: { page, totalPages, lastPage },
    };
  }

  async findOne(id: number) {
    const available: true = true;
    const product = await this.product.findUnique({ where: { id, available } });
    if (!product)
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
        code: 'PRODUCT_NOT_FOUND',
      });
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;

    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });
    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: { id: { in: ids }, available: true },
    });

    if (products.length !== ids.length) {
      const notFoundIds = ids.filter(id => !products.some(product => product.id === id));
      throw new RpcException({
        message: `Products with ids ${notFoundIds.join(', ')} not found`,
        status: HttpStatus.BAD_REQUEST,
        code: 'PRODUCT_NOT_FOUND',
      });
    }
    return products;
  }
}
