import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Airline } from '../entity/airline.model'
import { IsOptional } from 'class-validator'
import { PaginationInfo } from 'src/common/dtos/pagintion'

@ObjectType()
export class AirlineResponse extends BaseResponse {
  @Field(() => Airline, { nullable: true })
  data: Airline
}

@ObjectType()
export class AirlinesResponse extends BaseResponse {
  @Field(() => [Airline], { nullable: true })
  items: Airline[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
