import { InputType, Field } from '@nestjs/graphql'
import { Role } from 'src/common/constant/enum.constant'

@InputType()
export class CreateFlightCrewInput {
  @Field()
  flightId: string

  @Field()
  employeeId: string

  @Field(() => Role)
  role: Role
}
