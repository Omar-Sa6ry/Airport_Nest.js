import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class UpdateAirportDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(50)
  name?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(3)
  iataCode?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(4)
  icaoCode?: string
}
