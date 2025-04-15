import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Role } from 'src/common/constant/enum.constant'
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

  @Mutation(returns => EmployeeResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async createEmployee (
    @Args('userId') userId: string,
    @Args('airportId') airportId: string,
    @Args('role') role: Role,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.create(userId, airportId, role)
  }

  @Query(returns => EmployeeResponse)
  async getEmployeeById (@Args('id') id: string): Promise<EmployeeResponse> {
    const userCacheKey = `user:${id}`
    const cachedEmployee = await this.redisService.get(userCacheKey)
    if (cachedEmployee instanceof EmployeeResponse) {
      return { ...cachedEmployee }
    }

    return await this.employeeService.findById(id)
  }

  @Query(returns => EmployeeResponse)
  async getEmployeeByEmail (
    @Args('email') email: string,
  ): Promise<EmployeeResponse> {
    const userCacheKey = `user:${email}`
    const cachedEmployee = await this.redisService.get(userCacheKey)
    if (cachedEmployee instanceof EmployeeResponse) {
      return { ...cachedEmployee }
    }

    return await this.employeeService.findByEmail(email)
  }

  @Query(returns => EmployeeResponse)
  async getEmployeeByphone (
    @Args('phone') phone: string,
  ): Promise<EmployeeResponse> {
    const userCacheKey = `user:${phone}`
    const cachedEmployee = await this.redisService.get(userCacheKey)
    if (cachedEmployee instanceof EmployeeResponse) {
      return { ...cachedEmployee }
    }

    return await this.employeeService.findByPhone(phone)
  }

  @Mutation(returns => EmployeeResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async deleteEmployee (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.delete(user.id)
  }

  @Query(() => EmployeesResponse)
  async employeesInAirport (
    @Args('airportId') airportId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EmployeesResponse> {
    return this.employeeService.findEmployeeInAirport(airportId, page, limit)
  }

  @Mutation(returns => EmployeeResponse)
  @Auth(Role.ADMIN)
  async UpdateEmployeeRoleToAdmin (
    @Args('id') id: string,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.editUserRoleToManager(id)
  }

  @Mutation(returns => EmployeeResponse)
  @Auth(Role.MANAGER)
  async UpdateEmployeeRoleInairport (
    @Args('id') id: string,
    @Args('role') role: Role,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.editUserRoleInAirport(id, role)
  }
}
