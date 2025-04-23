import { InputType, Field, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { SeatClass } from 'src/common/constant/enum.constant'

@InputType()
export class UpdateTicketInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  seatId: string

  @IsOptional()
  @Field(() => SeatClass, { nullable: true })
  class: SeatClass

  @IsOptional()
  @Field(() => Int, { nullable: true })
  price: number
}
