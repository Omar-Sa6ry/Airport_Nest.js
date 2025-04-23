import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'

@ObjectType()
export class CreateTicketResponse extends BaseResponse {
  @Field(() => Ticket, { nullable: true })
  data: Ticket

  @Field()
  url: string
}
