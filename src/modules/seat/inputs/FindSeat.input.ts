import { InputType, Field, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { TicketClass } from 'src/common/constant/enum.constant'

@InputType()
export class FindSeatInput {
  @Field()
  flightId: string

  @IsOptional()
  @Field(() => TicketClass, { nullable: true })
  class: TicketClass
}
