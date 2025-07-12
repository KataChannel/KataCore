import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EmployeesService, CreateEmployeeDto, UpdateEmployeeDto, EmployeeFilters } from './employees.service';

@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      return await this.employeesService.create(createEmployeeDto);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Query() query: EmployeeFilters) {
    try {
      return await this.employeesService.findAll(query);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch employees',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics')
  async getStatistics() {
    try {
      return await this.employeesService.getStatistics();
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch statistics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.employeesService.findOne(id);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        throw new HttpException(
          { success: false, error: 'Employee not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    try {
      return await this.employeesService.update(id, updateEmployeeDto);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        throw new HttpException(
          { success: false, error: 'Employee not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.employeesService.remove(id);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        throw new HttpException(
          { success: false, error: 'Employee not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
