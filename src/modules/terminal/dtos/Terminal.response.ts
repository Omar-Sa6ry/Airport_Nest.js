import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Terminal } from '../entity/terminal.model'

@ObjectType()
export class TerminalOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  name: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => Airport)
  airport: Airport
}

@ObjectType()
export class TerminalResponse extends BaseResponse {
  @Field(() => TerminalOutput, { nullable: true })
  data: TerminalOutput
}

@ObjectType()
export class TerminalsOutput {
  @Field(() => Airport)
  airport: Airport

  @Field(() => [Terminal])
  terminals: Terminal[]
}

@ObjectType()
export class TerminalsResponse extends BaseResponse {
  @Field(() => TerminalsOutput, { nullable: true })
  items: TerminalsOutput

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
