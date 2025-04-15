import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from 'src/modules/airport/entity/airport.model'

@InputType()
export class EmployeeInput {
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

@InputType()
export class EmployeeWithAirportInput {
  @Field(() => EmployeeInput)
  employee: EmployeeInput

  @Field(() => Airport)
  airport: Airport
}

@InputType()
export class EmployeeInputResponse extends BaseResponse {
  @Field(() => EmployeeWithAirportInput, { nullable: true })
  data: EmployeeWithAirportInput
}

@InputType()
export class EmployeesWithAirportInput {
  @Field(() => [EmployeeInput])
  employees: EmployeeInput[]

  @Field(() => Airport)
  airport: Airport
}

@InputType()
export class EmployeeInputsResponse extends BaseResponse {
  @Field(() => EmployeesWithAirportInput, { nullable: true })
  items: EmployeesWithAirportInput

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
