import { Field, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { UserOutput } from 'src/modules/users/dtos/UserResponse.dto'

@ObjectType()
export class AuthOutPut {
  @Field(() => UserOutput)
  @Expose()
  user: UserOutput

  @Field()
  @Expose()
  token: string
}

@ObjectType()
export class AuthResponse extends BaseResponse {
  @Field(() => AuthOutPut, { nullable: true })
  @Expose()
  data: AuthOutPut
}
