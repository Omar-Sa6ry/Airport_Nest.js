import { InputType, Field, Int } from '@nestjs/graphql'
import { TicketClass } from 'src/common/constant/enum.constant'

@InputType()
export class CreateTicketInput {
  @Field(() => String)
  flightId: string

  @Field(() => String)
  seatId: string

  @Field(() => TicketClass)
  class: TicketClass
}
