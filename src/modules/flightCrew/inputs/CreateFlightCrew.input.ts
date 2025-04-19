import { InputType, Field } from '@nestjs/graphql'
import { CrewRole } from 'src/common/constant/enum.constant'

@InputType()
export class CreateFlightCrewInput {
  @Field()
  flightId: string

  @Field()
  employeeId: string

  @Field(() => CrewRole)
  role: CrewRole
}
