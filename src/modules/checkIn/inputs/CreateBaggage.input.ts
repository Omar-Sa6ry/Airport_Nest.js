import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateBagInput {
  @Field(() => Int)
  weight: number

  @Field(() => Int)
  limit: number
}
