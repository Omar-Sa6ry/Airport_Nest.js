import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'

@ObjectType()
export class BaggageData {
  @Field(() => String)
  id: string

  @Field(() => Int)
  limit: number

  @Field(() => Int)
  weight: number

  @Field(() => Ticket)
  ticket: Ticket
}

@ObjectType()
export class BaggageResponse extends BaseResponse {
  @Field(() => BaggageData, { nullable: true })
  data: BaggageData
}

@ObjectType()
export class BaggagesResponse extends BaseResponse {
  @Field(() => [BaggageData], { nullable: true })
  items: BaggageData[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
