import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Seat } from '../entity/seat.model'

@ObjectType()
export class SeatResponse extends BaseResponse {
  @Field(() => Seat, { nullable: true })
  data: Seat
}

@ObjectType()
export class SeatsResponse extends BaseResponse {
  @Field(() => [Seat], { nullable: true })
  items: Seat[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
