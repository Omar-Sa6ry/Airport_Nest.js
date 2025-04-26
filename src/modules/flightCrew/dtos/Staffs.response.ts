import { Field, Int, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { Role } from 'src/common/constant/enum.constant'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { User } from 'src/modules/users/entities/user.entity'

@ObjectType()
export class StaffsData {
  @Field(() => String)
  id: string

  @Field(() => User)
  user: User

  @Field(() => Role)
  role: Role
}

@ObjectType()
export class StaffsResponse extends BaseResponse {
  @Field(() => [StaffsData], { nullable: true })
  items: StaffsData[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
