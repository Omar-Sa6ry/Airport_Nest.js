import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { FlightStatus } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'

@ObjectType()
export class ToAirportFlightOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  flightNumber: string

  @Field(() => Airport)
  fromAirport: Airport

  @Field(() => Gate)
  gate: Gate

  @Field(() => Airline)
  airline: Airline

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
export class FlightsToAirportResponse extends BaseResponse {
  @Field(() => [ToAirportFlightOutput], { nullable: true })
  items: ToAirportFlightOutput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
