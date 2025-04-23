import { InputType, Field, Int } from '@nestjs/graphql'
import { SeatClass } from 'src/common/constant/enum.constant'

@InputType()
export class CreateSeatInput {
  @Field()
  flightId: string

  @Field(() => Int)
  price: number

  @Field(() => Int)
  seatNumber: number

  @Field(() => SeatClass)
  class: SeatClass
}
