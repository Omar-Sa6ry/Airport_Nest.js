import { Field, InputType } from '@nestjs/graphql'
import { IsString, MaxLength } from 'class-validator'

@InputType()
export class CreateAirportDto {
  @Field(() => String)
  @IsString()
  @MaxLength(50)
  name: string

  @Field(() => String)
  @IsString()
  @MaxLength(3)
  iataCode: string

  @Field(() => String)
  @IsString()
  @MaxLength(4)
  icaoCode: string
}
