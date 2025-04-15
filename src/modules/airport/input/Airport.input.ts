import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from '../entity/airport.model'

@InputType()
export class AirportInput {
  @Field(() => Airport)
  airport: Airport
}

@InputType()
export class AirportInputResponse extends BaseResponse {
  @Field(() => AirportInput, { nullable: true })
  data: AirportInput
}

@InputType()
export class AirportsInput {
  @Field(() => [Airport])
  airports: Airport[]
}

@InputType()
export class AirportInputsResponse extends BaseResponse {
  @Field(() => AirportsInput, { nullable: true })
  items: AirportsInput

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
