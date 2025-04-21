import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { Permission, Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { Airport } from '../airport/entity/airport.model'
import { AirportService } from '../airport/airport.service'
import { Location } from '../location/entity/location.model'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Auth } from 'src/common/decerator/auth.decerator'
import { LocationService } from '../location/location.service'
import { EmployeeService } from './employee.service'
import {
  EmployeeOutput,
  EmployeeResponse,
  EmployeesResponse,
} from './dto/Employee.response.dto'

@Resolver(() => EmployeeOutput)
export class EmployeeResolver {
  constructor (
    private readonly locationService: LocationService,
    private readonly airportService: AirportService,
    private readonly employeeService: EmployeeService,
    private readonly redisService: RedisService,
  ) {}

  @Mutation(() => EmployeeResponse)
  @Auth([Role.MANAGER], [Permission.EMPLOYEE_CREATE])
  async createEmployee (
    @CurrentUser() user: CurrentUserDto,
    @Args('userId') userId: string,
    @Args('airportId') airportId: string,
    @Args('role') role: Role,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.create(userId, airportId, role, user.id)
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
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.delete(id, user.id)
  }

  @Query(() => EmployeesResponse, { nullable: true })
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
  @Auth([Role.MANAGER], [Permission.EMPLOYEE_UPDATE_ROLE])
  async editUserRoleInAirport (
    @Args('id') id: string,
    @Args('role') role: Role,
  ): Promise<EmployeeResponse> {
    return await this.employeeService.editUserRoleInAirport(id, role)
  }

  @ResolveField(() => Location, { nullable: true })
  async location (@Parent() employee: EmployeeOutput): Promise<Location> {
    const location = await this.locationService.findByUser(employee.userId)
    return location.data
  }

  @ResolveField(() => Airport, { nullable: true })
  async airport (@Parent() employee: EmployeeOutput): Promise<Airport> {
    return (await this.airportService.findById(employee.airportId)).data
  }
}
