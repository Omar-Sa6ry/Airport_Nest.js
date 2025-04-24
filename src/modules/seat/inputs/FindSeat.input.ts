import { InputType, Field, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { SeatClass, SeatPosition } from 'src/common/constant/enum.constant'

@InputType()
export class FindSeatInput {
  @IsOptional()
  @Field({ nullable: true })
  flightId?: string

  @IsOptional()
  @Field(() => SeatClass, { nullable: true })
  class?: SeatClass

  @IsOptional()
  @Field(() => SeatPosition, { nullable: true })
  position?: SeatPosition
}
