import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString, MaxLength } from 'class-validator'

@InputType()
export class UpdateTerminalDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(10)
  name?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  airportId?: string

  @Field()
  @IsString()
  id: string
}
