import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { IsOptional } from 'class-validator'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Flight } from 'src/modules/flight/entity/flight.model'

@ObjectType()
export class FlightsInAirlinesResponse extends BaseResponse {
  @Field(() => [Flight], { nullable: true })
  items: Flight[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
