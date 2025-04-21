import { AirlineService } from './airline.service'
import { AirlineResponse, AirlinesResponse } from './dtos/Airline.response'
import { CreateLocationInput } from '../location/inputs/CreateLocation.input'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { FlightsInAirlinesResponse } from './dtos/FlightsInAirline.dto'
import { Location } from '../location/entity/location.model'
import { Airline } from './entity/airline.model'
import { LocationService } from '../location/location.service'
import { FlightService } from '../flight/flight.service'
import { Flight } from '../flight/entity/flight.model'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql'

@Resolver(() => Airline)
export class AirlineResolver {
  constructor (
    private readonly airlineService: AirlineService,
    private readonly flightService: FlightService,
    private readonly locationService: LocationService,
  ) {}

  @Mutation(() => AirlineResponse)
  @Auth([Role.ADMIN], [Permission.AIRLINE_CREATE])
  async createAirline (
    @CurrentUser() user: CurrentUserDto,
    @Args('name') name: string,
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
  ): Promise<AirlineResponse> {
    return this.airlineService.create(user.id, name, createLocationInput)
  }

  @Query(() => AirlineResponse)
  async findAirlineById (@Args('id') id: string): Promise<AirlineResponse> {
    return this.airlineService.findById(id)
  }

  @Query(() => AirlineResponse)
  async findAirlineByName (
    @Args('name') name: string,
  ): Promise<AirlineResponse> {
    return this.airlineService.findByName(name)
  }

  @Query(() => AirlinesResponse)
  async findAllAirlines (
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirlinesResponse> {
    return this.airlineService.findAll(page, limit)
  }

  @Query(() => FlightsInAirlinesResponse)
  @Auth([Role.ADMIN, Role.AIRLINE_MANAGER], [Permission.AIRLINE_MANAGE_FLIGHTS])
  async findAllFlightsInAirline (
    @Args('airlineId') airlineId: string,
  ): Promise<FlightsInAirlinesResponse> {
    return this.airlineService.findAllFlightInAirline(airlineId)
  }

  @Mutation(() => AirlineResponse)
  @Auth([Role.ADMIN, Role.AIRLINE_MANAGER], [Permission.AIRLINE_UPDATE])
  async updateAirline (
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
    @Args('name') name: string,
  ): Promise<AirlineResponse> {
    return this.airlineService.update(id, name, user.id)
  }

  @Mutation(() => AirlineResponse)
  @Auth([Role.ADMIN], [Permission.AIRLINE_DELETE])
  async deleteAirline (
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
  ): Promise<AirlineResponse> {
    return this.airlineService.delete(id, user.id)
  }

  @ResolveField(() => [Flight])
  async flights (@Parent() airline: Airline): Promise<Flight[]> {
    return this.flightService.findAllFlightInAirline(airline.id)
  }

  @ResolveField(() => Location)
  async location (@Parent() airline: Airline): Promise<Location> {
    return this.locationService.findAirlineById(airline?.id)
  }
}
