import { Field, InputType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { UserInput } from 'src/modules/users/input/User.input'

@InputType()
export class AuthInput {
  @Field(() => UserInput)
  @Expose()
  user: UserInput

  @Field()
  @Expose()
  token: string
}

@InputType()
export class AuthsInputResponse extends BaseResponse {
  @Field(() => [AuthInput], { nullable: true })
  items: AuthInput[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}

@InputType()
export class AuthInputResponse extends BaseResponse {
  @Field(() => AuthInput, { nullable: true })
  data: AuthInput
}
