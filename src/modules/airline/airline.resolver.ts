import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { AirlineService } from './airline.service'
import { AirlineResponse, AirlinesResponse } from './dtos/Airline.response'
import { CreateLocationInput } from '../location/inputs/CreateLocation.input'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { FlightsInAirlinesResponse } from './dtos/FlightsInAirline.dto'

@Resolver()
export class AirlineResolver {
  constructor (private readonly airlineService: AirlineService) {}

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
  @Auth([], [Permission.AIRLINE_READ])
  async findAirlineById (@Args('id') id: string): Promise<AirlineResponse> {
    return this.airlineService.findById(id)
  }

  @Query(() => AirlineResponse)
  @Auth([], [Permission.AIRLINE_READ])
  async findAirlineByName (
    @Args('name') name: string,
  ): Promise<AirlineResponse> {
    return this.airlineService.findByName(name)
  }

  @Query(() => AirlinesResponse)
  @Auth([], [Permission.AIRLINE_READ])
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
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<FlightsInAirlinesResponse> {
    return this.airlineService.findAllFlightInAirline(airlineId, page, limit)
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
}
