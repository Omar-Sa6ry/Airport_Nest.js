import { Field, Int, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { CheckIn } from '../entity/checkIn.entity'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'

@ObjectType()
export class CheckinInput extends BaseResponse {
  @Field(() => String)
  id: string

  @Field(() => Int)
  price: number

  @Field(() => Ticket)
  ticket: Ticket

  @Field(() => Gate)
  gate: Gate
}

@ObjectType()
export class CheckinResponse extends BaseResponse {
  @Field(() => CheckinInput, { nullable: true })
  data: CheckinInput
}

@ObjectType()
export class CheckinsResponse extends BaseResponse {
  @Field(() => [CheckIn], { nullable: true })
  items: CheckIn[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
