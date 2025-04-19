import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Currency } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airline } from 'src/modules/airline/entity/airline.model'

@ObjectType()
export class AirlineLocation {
  @Field()
  id: string

  @Field()
  country: string

  @Field()
  city: string

  @Field(() => Currency)
  currency: Currency

  @Field(() => Airline)
  airline: Airline
}

@ObjectType()
export class AirlineLocationsResponse extends BaseResponse {
  @Field(() => [AirlineLocation], { nullable: true })
  items: AirlineLocation[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
