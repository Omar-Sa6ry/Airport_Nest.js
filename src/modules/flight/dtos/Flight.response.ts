import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { FlightStatus } from 'src/common/constant/enum.constant'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'

@ObjectType()
export class FlightOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  flightNumber: string

  @Field(() => Airport)
  fromAirport: Airport

  @Field(() => Airport)
  toAirport: Airport

  @Field(() => Airline)
  airline: Airline

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

@ObjectType()
export class FlightResponse extends BaseResponse {
  @Field(() => FlightOutput, { nullable: true })
  data: FlightOutput
}
