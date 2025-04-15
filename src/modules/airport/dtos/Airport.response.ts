import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from '../entity/airport.model'

@ObjectType()
export class AirportsOutput {
  @Field(() => [Airport])
  airports: Airport[]
}

@ObjectType()
export class AirportsResponse extends BaseResponse {
  @Field(() => AirportsOutput, { nullable: true })
  items: AirportsOutput

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}

@ObjectType()
export class AirportOutput {
  @Field(() => Airport)
  airport: Airport
}

@ObjectType()
export class AirportResponse extends BaseResponse {
  @Field(() => AirportOutput, { nullable: true })
  data: AirportOutput
}


