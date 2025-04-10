import { Field, InputType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'

@InputType()
export class AdminInput {
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

  @Field(() => Role)
  role: Role
}

@InputType()
export class AdminInputResponse extends BaseResponse {
  @Field(() => AdminInput, { nullable: true })
  data: AdminInput
}
