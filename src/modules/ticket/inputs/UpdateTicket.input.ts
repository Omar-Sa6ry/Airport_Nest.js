import { InputType, Field, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { TicketClass } from 'src/common/constant/enum.constant'

@InputType()
export class UpdateTicketInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  seatId: string

  @IsOptional()
  @Field(() => TicketClass, { nullable: true })
  class: TicketClass

  @IsOptional()
  @Field(() => Int, { nullable: true })
  price: number
}
