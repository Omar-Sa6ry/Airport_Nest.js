import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Gate } from '../entity/gate.model'

@ObjectType()
export class GateOutput {
  @Field(() => String)
  id: string

  @Field(() => String)
  gateNumber: string

  @Field(() => Terminal)
  terminal: Terminal
}

@ObjectType()
export class GateResponse extends BaseResponse {
  @Field(() => GateOutput, { nullable: true })
  data: GateOutput
}

@ObjectType()
export class GateOutputs {
  @Field(() => [Gate])
  gates: Gate[]

  @Field(() => Terminal)
  terminal: Terminal
}

@ObjectType()
export class GatesResponse extends BaseResponse {
  @Field(() => GateOutputs, { nullable: true })
  items: GateOutputs

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
