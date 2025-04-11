import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@InputType()
export class UpdateAirportDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  name?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  iataCode?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  icaoCode?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  city?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  country?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  timezone?: string
}
