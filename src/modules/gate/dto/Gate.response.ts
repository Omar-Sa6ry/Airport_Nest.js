import { Field, ObjectType } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { PaginationInfo } from 'src/common/dtos/pagintion'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'
import { Gate } from '../entity/gate.model'

@ObjectType()
export class GateData {
  @Field(() => String)
  id: string

  @Field(() => String)
  gateNumber: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => Terminal)
  terminal: Terminal
}

@ObjectType()
export class GateDataResponse extends BaseResponse {
  @Field(() => GateData, { nullable: true })
  data: GateData
}

@ObjectType()
export class GateResponse extends BaseResponse {
  @Field(() => Gate, { nullable: true })
  data: Gate
}

@ObjectType()
export class GatesResponse extends BaseResponse {
  @Field(() => [Gate], { nullable: true })
  items: Gate[]

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo
}
