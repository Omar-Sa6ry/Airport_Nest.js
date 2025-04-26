import { InputType, Field } from '@nestjs/graphql'
import { Role } from 'src/common/constant/enum.constant'

@InputType()
export class CreateAirportCrewInput {
  @Field()
  airportId: string

  @Field()
  employeeId: string

  @Field(() => Role)
  role: Role
}
