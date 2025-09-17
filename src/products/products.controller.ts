import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @MessagePattern({ cmd: 'createProduct' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'findAllProducts' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'findOneProduct' })
  findOne(@Payload('id') id: number) {
    return this.productsService.findOne(+id);
  }

  @MessagePattern({ cmd: 'updateProduct' })
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }
  @MessagePattern({ cmd: 'deleteProduct' })
  remove(@Payload('id') id: number) {
    return this.productsService.remove(+id);
  }

  @MessagePattern({ cmd: 'validateProducts' })
  validateProduct( @Payload() ids: number[] ) {
    console.log('ids :>> ', ids);
    return this.productsService.validateProducts(ids);
  }
}
