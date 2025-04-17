import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { FlightStatus } from 'src/common/constant/enum.constant'

@InputType()
export class FlightOptinalInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  flightNumber: string

  @IsOptional()
  @Field(() => FlightStatus, { nullable: true })
  status: FlightStatus

  @IsOptional()
  @Field(() => Date, { nullable: true })
  leaveAt: Date

  @IsOptional()
  @Field(() => Date, { nullable: true })
  arriveAt: Date
}
