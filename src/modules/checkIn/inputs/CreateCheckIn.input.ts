import { InputType, Field, Int } from '@nestjs/graphql'

@InputType()
export class CreateCheckInInput {
  @Field(() => Int)
  price: number

  @Field(() => String)
  gateId: string
}
