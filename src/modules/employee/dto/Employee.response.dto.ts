import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { AirportOutput } from 'src/modules/airport/dtos/airport.response'

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

  @Field(() => AirportOutput)
  airport: AirportOutput
}

@ObjectType()
export class EmployeeResponse extends BaseResponse {
  @Field(() => EmployeeOutput, { nullable: true })
  data: EmployeeOutput
}

@ObjectType()
export class EmployeesResponse extends BaseResponse {
  @Field(() => [EmployeeOutput], { nullable: true })
  items: EmployeeOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
