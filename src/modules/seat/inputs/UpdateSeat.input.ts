import { Field, InputType, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { SeatClass, SeatPosition } from 'src/common/constant/enum.constant'

@InputType()
export class UpdateSeatInput {
  @IsOptional()
  @Field(() => Int, { nullable: true })
  price?: number

  @IsOptional()
  @Field(() => Int, { nullable: true })
  seatNumber?: number

  @IsOptional()
  @Field(() => SeatClass, { nullable: true })
  class?: SeatClass

  @IsOptional()
  @Field({ nullable: true })
  isAvailable?: boolean

  @IsOptional()
  @Field(() => SeatPosition, { nullable: true })
  position?: SeatPosition
}
