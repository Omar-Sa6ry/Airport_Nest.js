import { InputType, Field } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'
import { Currency } from 'src/common/constant/enum.constant'

@InputType()
export class CreateLocationInput {
  @IsOptional()
  @Field({ nullable: true })
  userId?: string

  @IsOptional()
  @Field({ nullable: true })
  airportId?: string

  @IsOptional()
  @Field({ nullable: true })
  airlineId?: string

  @Field()
  country: string

  @Field()
  city: string

  @Field(() => Currency)
  currency: Currency
}
