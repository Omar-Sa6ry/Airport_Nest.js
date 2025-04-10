import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'

@ObjectType()
export class AdminOutput {
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

@ObjectType()
export class AdminResponse extends BaseResponse {
  @Field(() => AdminOutput, { nullable: true })
  data: AdminOutput
}
