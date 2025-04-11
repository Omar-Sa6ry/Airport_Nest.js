import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from '../entity/airport.model'
import { Role } from 'src/common/constant/enum.constant'

@ObjectType()
export class EmployeeOutputType {
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
export class AirportOutput {
  @Field(() => Airport)
  airport: Airport

  @Field(() => [EmployeeOutputType], { nullable: true })
  employees: EmployeeOutputType[]
}

@ObjectType()
export class AirportsResponse extends BaseResponse {
  @Field(() => [AirportOutput], { nullable: true })
  items: AirportOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}

@ObjectType()
export class AirportResponse extends BaseResponse {
  @Field(() => AirportOutput, { nullable: true })
  data: AirportOutput
}
