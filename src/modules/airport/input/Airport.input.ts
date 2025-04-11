import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from '../entity/airport.model'
import { Role } from 'src/common/constant/enum.constant'

@InputType()
export class EmployeeInputType {
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
export class AirportInput {
  @Field(() => Airport)
  airport: Airport

  @Field(() => [EmployeeInputType], { nullable: true })
  employees: EmployeeInputType[]
}

@InputType()
export class AirportInputsResponse extends BaseResponse {
  @Field(() => [AirportInput], { nullable: true })
  items: AirportInput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}

@InputType()
export class AirportInputResponse extends BaseResponse {
  @Field(() => AirportInput, { nullable: true })
  data: AirportInput
}
