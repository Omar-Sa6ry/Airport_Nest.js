import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString, IsPhoneNumber } from 'class-validator'

@InputType()
export class CreateUserDto {
  @Field(() => String)
  @IsString()
  firstName: string

  @Field(() => String)
  @IsString()
  lastName: string

  @Field()
  @IsEmail()
  email: string

  @Field()
  @IsPhoneNumber('EG')
  phone: string

  @Field(() => String)
  @IsString()
  password: string
}
