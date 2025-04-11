import { Field, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { EmployeeOutput } from 'src/modules/employee/dto/Employee.response.dto'

@ObjectType()
export class AdminAuthOutPut {
  @Field(() => EmployeeOutput)
  @Expose()
  user: EmployeeOutput

  @Field()
  @Expose()
  token: string
}

@ObjectType()
export class AdminAuthResponse extends BaseResponse {
  @Field(() => AdminAuthOutPut, { nullable: true })
  @Expose()
  data: AdminAuthOutPut
}
