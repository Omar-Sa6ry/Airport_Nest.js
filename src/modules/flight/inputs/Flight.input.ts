import { Field, InputType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { FlightStatus } from 'src/common/constant/enum.constant'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'

@InputType()
export class FlightInput {
  @Field(() => String)
  id: string

  @Field(() => String)
  flightNumber: string

  @Field(() => Airport)
  fromAirport: Airport

  @Field(() => Airport)
  toAirport: Airport

  @Field(() => Gate)
  gate: Gate

  @Field(() => FlightStatus)
  status: FlightStatus

  @Field(() => Date)
  leaveAt: Date

  @Field(() => Date)
  arriveAt: Date

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

@InputType()
export class FlightInputResponse extends BaseResponse {
  @Field(() => FlightInput, { nullable: true })
  data: FlightInput
}




