import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Terminal } from '../entity/terminal.model'

@InputType()
export class TerminalInputResponse extends BaseResponse {
  @Field(() => Terminal, { nullable: true })
  data: Terminal
}

@InputType()
export class TerminalInputsResponse extends BaseResponse {
  @Field(() => [Terminal], { nullable: true })
  items: Terminal[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
