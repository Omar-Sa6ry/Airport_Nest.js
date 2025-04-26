import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Staff } from '../entity/flightCrew.model'

@ObjectType()
export class StaffResponse extends BaseResponse {
  @Field(() => Staff, { nullable: true })
  data: Staff
}
