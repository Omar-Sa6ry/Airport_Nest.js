import { Field, InputType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { EmployeeInput } from 'src/modules/employee/input/Employee.input'

@InputType()
export class AuthEmployeeInput {
  @Field(() => EmployeeInput)
  @Expose()
  user: EmployeeInput

  @Field()
  @Expose()
  token: string
}

@InputType()
export class AuthEmployeeInputResponse extends BaseResponse {
  @Field(() => AuthEmployeeInput, { nullable: true })
  data: AuthEmployeeInput
}
