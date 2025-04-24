import { InputType, Field, Int } from '@nestjs/graphql'
import { SeatClass, SeatPosition } from 'src/common/constant/enum.constant'

@InputType()
export class CreateSeatInput {
  @Field()
  flightId: string

  @Field(() => Int)
  price: number

  @Field(() => Int)
  seatNumber: number

  @Field(() => SeatPosition)
  position: SeatPosition

  @Field(() => SeatClass)
  class: SeatClass
}
