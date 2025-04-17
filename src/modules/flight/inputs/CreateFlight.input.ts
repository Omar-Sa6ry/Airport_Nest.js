import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateFlightInput {
  @Field(() => String)
  flightNumber: string

  @Field(() => String)
  toAirportId: string

  @Field(() => String)
  fromAirportId: string

  @Field(() => String)
  gateId: string

  @Field(() => Date)
  leaveAt: Date

  @Field(() => Date)
  arriveAt: Date
}
