import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from '../entity/airport.model'

@ObjectType()
export class AirportsResponse extends BaseResponse {
  @Field(() => [Airport], { nullable: true })
  items: Airport[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}

@ObjectType()
export class AirportResponse extends BaseResponse {
  @Field(() => Airport, { nullable: true })
  data: Airport
}
