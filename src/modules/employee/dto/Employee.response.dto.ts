import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from 'src/modules/airport/entity/airport.model'

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

  @Field(() => Role)
  role: Role
}

@ObjectType()
export class EmployeeWithAirportInput {
  @Field(() => EmployeeOutput)
  employee: EmployeeOutput

  @Field(() => Airport)
  airport: Airport
}

@ObjectType()
export class EmployeeResponse extends BaseResponse {
  @Field(() => EmployeeWithAirportInput, { nullable: true })
  data: EmployeeWithAirportInput
}

@ObjectType()
export class EmployeesWithAirportOtput {
  @Field(() => [EmployeeOutput])
  employees: EmployeeOutput[]

  @Field(() => Airport)
  airport: Airport
}

@ObjectType()
export class EmployeesResponse extends BaseResponse {
  @Field(() => EmployeesWithAirportOtput, { nullable: true })
  items: EmployeesWithAirportOtput

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
