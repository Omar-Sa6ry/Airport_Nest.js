import { Field, Int, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'

@ObjectType()
export class UserOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  passengerId: string

  @Field(() => String)
  firstName: string

  @Field(() => String)
  lastName: string

  @Field(() => String)
  fullName: string

  @Field(() => String)
  fcmToken: string

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

@ObjectType()
export class UserResponse extends BaseResponse {
  @Field(() => UserOutput, { nullable: true })
  data: UserOutput
}
