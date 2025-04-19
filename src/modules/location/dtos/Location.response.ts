import { Field, ObjectType } from '@nestjs/graphql'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Location } from '../entity/location.model'

@ObjectType()
export class LocationResponse extends BaseResponse {
  @Field(() => Location, { nullable: true })
  data: Location
}

