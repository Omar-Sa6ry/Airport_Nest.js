import { Field, InputType, Int } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'

@InputType()
export class UpdateBaggageInput {
  @IsOptional()
  @Field(() => Int, { nullable: true })
  weight?: number

  @IsOptional()
  @Field(() => Int, { nullable: true })
  limit?: number
}
