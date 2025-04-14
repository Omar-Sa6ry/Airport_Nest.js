import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@InputType()
export class CreateTerminalDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  name?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  airportId?: string
}
