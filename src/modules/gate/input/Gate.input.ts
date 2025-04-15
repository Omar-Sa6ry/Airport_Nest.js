import { Field, InputType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Gate } from '../entity/gate.model'

@InputType()
export class GateInput {
  @Field(() => String)
  id: string

  @Field(() => String)
  gateNumber: string

  @Field(() => Terminal)
  terminal: Terminal
}

@InputType()
export class GateInputResponse extends BaseResponse {
  @Field(() => GateInput, { nullable: true })
  data: GateInput
}

@InputType()
export class GateInputs {
  @Field(() => [Gate])
  gates: Gate[]

  @Field(() => Terminal)
  terminal: Terminal
}

@InputType()
export class GateInputsResponse extends BaseResponse {
  @Field(() => GateInputs, { nullable: true })
  items: GateInputs

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
