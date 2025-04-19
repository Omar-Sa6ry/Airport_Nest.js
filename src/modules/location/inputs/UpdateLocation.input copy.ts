import { InputType, Field } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { Currency } from 'src/common/constant/enum.constant'

@InputType()
export class UpdateLocationInput {
  @IsOptional()
  @Field({ nullable: true })
  country?: string

  @IsOptional()
  @Field({ nullable: true })
  city?: string

  @IsOptional()
  @Field(() => Currency, { nullable: true })
  currency?: Currency
}
