import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Terminal } from '../entity/terminal.model'

@InputType()
export class TerminalInput {
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

@InputType()
export class TerminalInputResponse extends BaseResponse {
  @Field(() => TerminalInput, { nullable: true })
  data: TerminalInput
}

@InputType()
export class TerminalsInput {
  @Field(() => Airport)
  airport: Airport

  @Field(() => [Terminal])
  terminals: Terminal[]
}

@InputType()
export class TerminalInputsResponse extends BaseResponse {
  @Field(() => TerminalsInput, { nullable: true })
  items: TerminalsInput

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
