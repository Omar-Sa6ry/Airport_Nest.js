import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Terminal } from '../entity/terminal.model'

@ObjectType()
export class TerminalResponse extends BaseResponse {
  @Field(() => Terminal, { nullable: true })
  data: Terminal
}

@ObjectType()
export class TerminalsResponse extends BaseResponse {
  @Field(() => [Terminal], { nullable: true })
  items: Terminal[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
