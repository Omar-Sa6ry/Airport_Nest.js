import { Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@InputType()
export class CreateAirportDto {
  @Field(() => String)
  @IsString()
  name: string

  @Field(() => String)
  @IsString()
  iataCode: string

  @Field(() => String)
  @IsString()
  icaoCode: string

  @Field(() => String)
  @IsString()
  city: string

  @Field(() => String)
  @IsString()
  country: string

  @Field(() => String)
  @IsString()
  timezone: string
}
