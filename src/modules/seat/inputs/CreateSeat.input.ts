import { InputType, Field, Int } from '@nestjs/graphql'
import { TicketClass } from 'src/common/constant/enum.constant'

@InputType()
export class CreateSeatInput {
  @Field()
  flightId: string

  @Field(() => Int)
  seatNumber: number

  @Field(() => TicketClass)
  class: TicketClass
}
