import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Permission, Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Auth } from 'src/common/decerator/auth.decerator'
import { EmployeeService } from './employee.service'
import { Employee } from './entity/employee.model'
import {
  EmployeeResponse,
  EmployeesResponse,
} from './dto/Employee.response.dto'

@Resolver(() => Employee)
export class EmployeeResolver {
  constructor (
    private employeeService: EmployeeService,
    private readonly redisService: RedisService,
  ) {}

  @Mutation(() => EmployeeResponse)
  @Auth([Role.MANAGER], [Permission.EMPLOYEE_CREATE])
  async createEmployee (
    @Args('userId') userId: string,
    @Args('airportId') airportId: string,
    @Args('role') role: Role,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.create(userId, airportId, role)
  }

  @Query(() => EmployeeResponse)
  @Auth(
    [Role.ADMIN, Role.MANAGER, Role.AIRLINE_MANAGER, Role.SECURITY],
    [Permission.EMPLOYEE_READ],
  )
  async getEmployeeById (@Args('id') id: string): Promise<EmployeeResponse> {
    const cachedEmployee = await this.redisService.get(`user:${id}`)
    if (cachedEmployee instanceof EmployeeResponse) {
      return { ...cachedEmployee }
    }

    const employee = await this.employeeService.findById(id)
    return employee
  }

  @Query(() => EmployeeResponse)
  @Auth(
    [Role.ADMIN, Role.MANAGER, Role.AIRLINE_MANAGER, Role.SECURITY],
    [Permission.EMPLOYEE_READ],
  )
  async getEmployeeByEmail (
    @Args('email') email: string,
  ): Promise<EmployeeResponse> {
    const cachedEmployee = await this.redisService.get(`user:${email}`)
    if (cachedEmployee instanceof EmployeeResponse) {
      return { ...cachedEmployee }
    }

    const employee = await this.employeeService.findByEmail(email)
    return employee
  }

  @Query(() => EmployeeResponse)
  @Auth(
    [Role.ADMIN, Role.MANAGER, Role.AIRLINE_MANAGER, Role.SECURITY],
    [Permission.EMPLOYEE_READ],
  )
  async getEmployeeByPhone (
    @Args('phone') phone: string,
  ): Promise<EmployeeResponse> {
    const cachedEmployee = await this.redisService.get(`user:${phone}`)
    if (cachedEmployee instanceof EmployeeResponse) {
      return { ...cachedEmployee }
    }

    return await this.employeeService.findByPhone(phone)
  }

  @Mutation(() => EmployeeResponse)
  @Auth([Role.ADMIN, Role.MANAGER], [Permission.EMPLOYEE_DELETE])
  async deleteEmployee (
    @Args('id') id: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.delete(id)
  }

  @Query(() => EmployeesResponse)
  @Auth(
    [Role.ADMIN, Role.MANAGER, Role.AIRLINE_MANAGER, Role.SECURITY],
    [Permission.EMPLOYEE_READ_ALL],
  )
  async employeesInAirport (
    @Args('airportId') airportId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EmployeesResponse> {
    return this.employeeService.findEmployeeInAirport(airportId, page, limit)
  }

  @Mutation(() => EmployeeResponse)
  @Auth([Role.ADMIN], [Permission.EMPLOYEE_PROMOTE])
  async editUserRoleToManager (
    @Args('id') id: string,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.editUserRoleToManager(id)
  }

  @Mutation(() => EmployeeResponse)
  @Auth([Role.ADMIN], [Permission.EMPLOYEE_UPDATE_ROLE])
  async editUserRoleInAirport (
    @Args('id') id: string,
    @Args('role') role: Role,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.editUserRoleInAirport(id, role)
  }
}
