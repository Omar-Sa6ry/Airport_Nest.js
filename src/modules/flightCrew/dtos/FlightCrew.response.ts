import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { CrewRole } from 'src/common/constant/enum.constant'
import { Flight } from 'src/modules/flight/entity/flight.model'
import { User } from 'src/modules/users/entities/user.entity'

@ObjectType()
export class FlightCrewData {
  @Field(() => String)
  id: string

  @Field(() => Flight)
  flight: Flight

  @Field(() => User)
  user: User

  @Field(() => CrewRole)
  role: CrewRole
}

@ObjectType()
export class FlightCrewResponse extends BaseResponse {
  @Field(() => FlightCrewData, { nullable: true })
  data: FlightCrewData
}
