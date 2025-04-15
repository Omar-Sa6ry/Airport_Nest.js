import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class CreateGateDto {
  @Field()
  gateNumber: string

  @Field()
  terminalId: string
}
