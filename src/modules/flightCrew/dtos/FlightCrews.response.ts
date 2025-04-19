import { Field, Int, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { User } from 'src/modules/users/entities/user.entity'
import { CrewRole } from 'src/common/constant/enum.constant'

@ObjectType()
export class FllghtCrewsData {
  @Field(() => String)
  id: string

  @Field(() => User)
  user: User

  @Field(() => CrewRole)
  role: CrewRole
}

@ObjectType()
export class FllghtCrewsResponse extends BaseResponse {
  @Field(() => [FllghtCrewsData], { nullable: true })
  items: FllghtCrewsData[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
