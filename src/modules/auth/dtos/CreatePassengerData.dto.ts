import { Field, InputType, Int } from '@nestjs/graphql'
import { IsString, IsDate, IsInt, MaxLength } from 'class-validator'

@InputType()
export class CreatePassengerDto {
  @Field(() => Int)
  @IsInt()
  passportNumber: number

  @Field(() => String)
  @IsString()
  @MaxLength(50)
  nationality: string

  @Field(() => Date)
  @IsDate()
  dateOfBirth: Date
}
