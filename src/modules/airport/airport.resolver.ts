import { CreateAirportDto } from './input/CreateAirport.dto'
import { UpdateAirportDto } from './input/UpdateAirport.dto'
import { AirportService } from './airport.service'
import { Airport } from './entity/airport.model'
import { Terminal } from '../terminal/entity/terminal.model'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CreateLocationInput } from '../location/inputs/CreateLocation.input'
import { Role, Permission, AllRoles } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { LocationService } from '../location/location.service'
import { Location } from '../location/entity/location.model'
import { GateService } from '../gate/gate.service'
import { AirportResponse, AirportsResponse } from './dtos/airport.response'
import { TerminalService } from '../terminal/terminal.service'
import { GateData } from '../gate/dto/Gate.response'
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

@Resolver(() => Airport)
export class AirportResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly airportService: AirportService,
    private readonly employeeService: EmployeeService,
    private readonly terminalService: TerminalService,
    private readonly locationService: LocationService,
    private readonly gateService: GateService,
  ) {}

  @Mutation(() => AirportResponse)
  @Auth([Role.ADMIN], [Permission.AIRPORT_CREATE])
  async createAirport (
    @Args('createAirportDto') createAirportDto: CreateAirportDto,
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
  ): Promise<AirportResponse> {
    const airport = await this.airportService.create(
      createAirportDto,
      createLocationInput,
    )
    return airport
  }

  @Mutation(() => AirportResponse)
  @Auth([Role.ADMIN], [Permission.AIRPORT_UPDATE])
  async updateAirport (
    @Args('id') id: string,
    @Args('updateAirportDto') updateAirportDto: UpdateAirportDto,
  ): Promise<AirportResponse> {
    return this.airportService.update(id, updateAirportDto)
  }

  @Mutation(() => AirportResponse)
  @Auth([Role.ADMIN], [Permission.AIRPORT_DELETE])
  async deleteAirport (@Args('id') id: string): Promise<AirportResponse> {
    return this.airportService.delete(id)
  }

  @Query(() => AirportResponse)
  @Auth(AllRoles, [Permission.AIRPORT_READ])
  async airportById (@Args('id') id: string): Promise<AirportResponse> {
    const cachedAirport = await this.redisService.get(`airport:${id}`)

    if (cachedAirport instanceof AirportResponse) {
      return { ...cachedAirport }
    }

    return this.airportService.findById(id)
  }

  @Query(() => AirportResponse)
  @Auth(AllRoles, [Permission.AIRPORT_READ])
  async airportByName (@Args('name') name: string): Promise<AirportResponse> {
    return await this.airportService.findByName(name)
  }

  @Query(() => AirportsResponse)
  @Auth(AllRoles, [Permission.AIRPORT_READ_ALL])
  async allAirports (
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirportsResponse> {
    return this.airportService.findAll(page, limit)
  }

  @ResolveField(() => EmployeesResponse, { nullable: true })
  async employees (
    @Parent() airport: Airport,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EmployeesResponse> {
    return this.employeeService.findEmployeeInAirport(airport.id, page, limit)
  }

  @ResolveField(() => [Terminal], { nullable: true })
  async terminals (
    @Parent() airport: Airport,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Terminal[]> {
    const terminals = await this.terminalService.findTerminalsInAirport(
      airport.id,
      page,
      limit,
    )
    return terminals?.items
  }

  @ResolveField(() => [GateData], { nullable: true })
  async gates (@Parent() airport: Airport): Promise<GateData[]> {
    return this.gateService.findGatesInAirport(airport.id)
  }

  @ResolveField(() => Location)
  async location (@Parent() airport: Airport): Promise<Location> {
    return this.locationService.findAirportById(airport?.id)
  }
}
