import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Employee } from '../entity/employee.model'

@ObjectType()
export class EmployeeOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  firstName: string

  @Field(() => String)
  lastName: string

  @Field(() => String)
  fullName: string

  @Field(() => String)
  phone: string

  @Field(() => String)
  email: string

  @Field(() => String, { nullable: true })
  airportId: string

  @Field(() => String, { nullable: true })
  userId: string

  @Field(() => Role)
  role: Role
}

@ObjectType()
export class EmployeeResponse extends BaseResponse {
  @Field(() => Employee, { nullable: true })
  data: Employee
}

@ObjectType()
export class EmployeesResponse extends BaseResponse {
  @Field(() => [EmployeeOutput], { nullable: true })
  items: EmployeeOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
