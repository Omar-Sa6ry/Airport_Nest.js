import { CreateAirportDto } from './dtos/CreateAirport.dto'
import { UpdateAirportDto } from './dtos/UpdateAirport.dto'
import { AirportService } from './airport.service'
import { Airport } from './entity/airport.model'
import { Terminal } from '../terminal/entity/terminal.model'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CreateLocationInput } from '../location/inputs/CreateLocation.input'
import { Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { AirportResponse, AirportsResponse } from './dtos/airport.response'
import { TerminalService } from '../terminal/terminal.service'
import { EmployeesResponse } from '../employee/dto/Employee.response.dto'
import { EmployeeService } from '../employee/employee.service'
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'

@Resolver(of => Airport)
export class AirportResolver {
  constructor (
    private readonly redisService: RedisService,
    private airportService: AirportService,
    private employeeService: EmployeeService,
    private termoinalService: TerminalService,
  ) {}

  @Mutation(() => AirportResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async createAirport (
    @Args('createAirportDto') createAirportDto: CreateAirportDto,
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
  ): Promise<AirportResponse> {
    return this.airportService.create(createAirportDto, createLocationInput)
  }

  @Mutation(() => AirportResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async updateAirport (
    @Args('id') id: string,
    @Args('updateAirportDto') updateAirportDto: UpdateAirportDto,
  ): Promise<AirportResponse> {
    return this.airportService.update(id, updateAirportDto)
  }

  @Mutation(() => AirportResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async deleteAirport (@Args('id') id: string): Promise<AirportResponse> {
    return this.airportService.delete(id)
  }

  @Query(() => AirportResponse)
  async airportById (@Args('id') id: string): Promise<AirportResponse> {
    const airportCacheKey = `airport:${id}`
    const cachedAirport = await this.redisService.get(airportCacheKey)

    if (cachedAirport instanceof AirportResponse) {
      return { ...cachedAirport }
    }

    return this.airportService.findById(id)
  }

  @Query(() => AirportResponse)
  async airportByName (@Args('name') name: string): Promise<AirportResponse> {
    const airportCacheKey = `airport-name:${name}`
    const cachedAirport = await this.redisService.get(airportCacheKey)

    if (cachedAirport instanceof AirportResponse) {
      return { ...cachedAirport }
    }

    return this.airportService.findByName(name)
  }

  @Query(() => AirportsResponse)
  async allAirports (
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirportsResponse> {
    return this.airportService.findAll(page, limit)
  }

  @ResolveField(() => EmployeesResponse)
  async employees (
    @Parent() airport: Airport,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EmployeesResponse> {
    const employees = await this.employeeService.findEmployeeInAirport(
      airport.id,
      page,
      limit,
    )
    return employees
  }

  @ResolveField(() => [Terminal])
  async terminals (
    @Parent() airport: Airport,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Terminal[]> {
    const terminals = await this.termoinalService.findTerminalsInAirport(
      airport.id,
      page,
      limit,
    )
    return terminals.items
  }
}
