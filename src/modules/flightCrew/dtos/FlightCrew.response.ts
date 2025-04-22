import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { FlightCrew } from '../entity/flightCrew.model'

@ObjectType()
export class FlightCrewResponse extends BaseResponse {
  @Field(() => FlightCrew, { nullable: true })
  data: FlightCrew
}
