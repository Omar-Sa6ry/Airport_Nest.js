import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class CreateTicketInput {
  @Field(() => String)
  seatId: string
}
