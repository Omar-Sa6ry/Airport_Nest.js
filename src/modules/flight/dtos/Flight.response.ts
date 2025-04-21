import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { FlightStatus } from 'src/common/constant/enum.constant'

@ObjectType()
export class FlightOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  gateId: string

  @Field(() => String)
  flightNumber: string

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
