import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { AirportInput } from 'src/modules/airport/input/Airport.input'

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

  @Field(() => AirportInput)
  airport: AirportInput
}

@InputType()
export class EmployeeInputResponse extends BaseResponse {
  @Field(() => EmployeeInput, { nullable: true })
  data: EmployeeInput
}

@InputType()
export class EmployeeInputsResponse extends BaseResponse {
  @Field(() => [EmployeeInput], { nullable: true })
  items: EmployeeInput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
