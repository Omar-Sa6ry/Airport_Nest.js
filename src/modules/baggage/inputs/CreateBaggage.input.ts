import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateBaggageInput {
  @Field(() => String)
  ticketId: string

  @Field(() => Int)
  weight: number

  @Field(() => Int)
  limit: number
}
