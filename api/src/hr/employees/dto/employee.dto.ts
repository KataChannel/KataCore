import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { EmployeeStatus, ContractType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  employeeId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsString()
  workLocation?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  socialInsurance?: string;

  @IsOptional()
  @IsString()
  healthInsurance?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsString()
  workLocation?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  socialInsurance?: string;

  @IsOptional()
  @IsString()
  healthInsurance?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
