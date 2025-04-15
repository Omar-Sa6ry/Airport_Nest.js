import { Field, InputType } from '@nestjs/graphql'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsOptional,
  MaxLength,
} from 'class-validator'

@InputType()
export class UpdateUserDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(50)
  firstName?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(50)
  lastName?: string

  @Field({ nullable: true })
  @IsOptional()
  avatar?: CreateImagDto

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  email?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('EG')
  phone?: string
}
