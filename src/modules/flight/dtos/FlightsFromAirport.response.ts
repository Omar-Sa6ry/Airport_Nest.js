import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { FlightStatus } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'

@ObjectType()
export class FromAirportFlightOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  flightNumber: string

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

@ObjectType()
export class FromAirportFlights {
  @Field(() => [FromAirportFlightOutput])
  flights: FromAirportFlightOutput[]

  @Field(() => Airport)
  fromAirport: Airport
}

@ObjectType()
export class FlightsFromAirportResponse extends BaseResponse {
  @Field(() => [FromAirportFlightOutput], { nullable: true })
  items: FromAirportFlightOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
