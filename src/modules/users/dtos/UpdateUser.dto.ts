import { Field, InputType } from '@nestjs/graphql'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'
import { IsEmail, IsString, IsPhoneNumber, IsOptional } from 'class-validator'

@InputType()
export class UpdateUserDto {
  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  firstName?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  @IsString()
  lastName?: string

  @Field({ nullable: true })
  @IsOptional()
  avatar?: CreateImagDto

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('EG')
  phone?: string
}
