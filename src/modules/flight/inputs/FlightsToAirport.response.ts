import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { FlightStatus } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'

@InputType()
export class ToAirportFlightInput {
  @Field(() => String)
  id: string

  @Field(() => String)
  flightNumber: string

  @Field(() => Airport)
  fromAirport: Airport

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
export class ToAirportFlightInputs {
  @Field(() => [ToAirportFlightInput])
  flights: ToAirportFlightInput[]

  @Field(() => Airport)
  toAirport: Airport
}

@InputType()
export class FlightInputsToAirportResponse extends BaseResponse {
  @Field(() => ToAirportFlightInputs, { nullable: true })
  items: ToAirportFlightInputs

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
