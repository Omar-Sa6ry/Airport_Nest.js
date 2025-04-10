import { Field, InputType, Int } from '@nestjs/graphql'
import { IsString, IsDate, IsInt } from 'class-validator'

@InputType()
export class CreatePassengerDto {
  @Field(() => Int)
  @IsInt()
  passportNumber: number

  @Field(() => String)
  @IsString()
  nationality: string

  @Field(() => Date)
  @IsDate()
  dateOfBirth: Date
}
