import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Location } from '../entity/location.model'

@ObjectType()
export class LocationResponse extends BaseResponse {
  @Field(() => Location, { nullable: true })
  data: Location
}

