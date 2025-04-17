import { Field, InputType, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { TicketClass } from 'src/common/constant/enum.constant'

@InputType()
export class UpdateSeatInput {
  @IsOptional()
  @Field(() => Int, { nullable: true })
  seatNumber?: number

  @IsOptional()
  @Field(() => TicketClass, { nullable: true })
  class?: TicketClass

  @IsOptional()
  @Field({ nullable: true })
  isAvailable?: boolean
}
