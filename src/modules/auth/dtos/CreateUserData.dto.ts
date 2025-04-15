import { Field, InputType } from '@nestjs/graphql'
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  Length,
  MaxLength,
} from 'class-validator'

@InputType()
export class CreateUserDto {
  @Field(() => String)
  @IsString()
  @MaxLength(50)
  firstName: string

  @Field(() => String)
  @IsString()
  @MaxLength(50)
  lastName: string

  @Field()
  @IsEmail()
  @MaxLength(50)
  email: string

  @Field()
  @IsPhoneNumber('EG')
  phone: string

  @Field(() => String)
  @IsString()
  @MaxLength(50)
  password: string
}
