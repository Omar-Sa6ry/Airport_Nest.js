import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Currency } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from 'src/modules/airport/entity/airport.model'

@ObjectType()
export class AirportLocation {
  @Field()
  id: string

  @Field()
  country: string

  @Field()
  city: string

  @Field(() => Currency)
  currency: Currency

  @Field(() => Airport)
  airport: Airport
}

@ObjectType()
export class AirportLocationsResponse extends BaseResponse {
  @Field(() => [AirportLocation], { nullable: true })
  items: AirportLocation[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
