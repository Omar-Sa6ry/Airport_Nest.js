import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'

@InputType()
export class UserInput {
  @Field(() => String)
  id: string

  @Field(() => String)
  firstName: string

  @Field(() => String)
  lastName: string

  @Field(() => String)
  fullName: string

  @Field(() => String)
  phone: string

  @Field(() => String)
  email: string

  @Field(() => Int)
  passportNumber: number

  @Field(() => String)
  nationality: string

  @Field(() => Date)
  dateOfBirth: Date
}

@InputType()
export class UserInputResponse extends BaseResponse {
  @Field(() => UserInput, { nullable: true })
  data: UserInput
}
