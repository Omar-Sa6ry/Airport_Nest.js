import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Ticket } from '../entity/ticket.model'

@ObjectType()
export class TicketResponse extends BaseResponse {
  @Field(() => Ticket, { nullable: true })
  data: Ticket
}

@ObjectType()
export class TicketsResponse extends BaseResponse {
  @Field(() => [Ticket], { nullable: true })
  items: Ticket[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
