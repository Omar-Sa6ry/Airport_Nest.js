import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'

@ObjectType()
export class CreateCheckinResponse extends BaseResponse {
  @Field(() => String, { nullable: true })
  data: string
}
