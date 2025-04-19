import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { LocationService } from './location.service'
import { LocationResponse } from './dtos/location.response'
import { UpdateLocationInput } from './inputs/UpdateLocation.input copy'
import { AirportLocationsResponse } from './dtos/Locations.response'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'

@Resolver()
export class LocationResolver {
  constructor (private readonly locationService: LocationService) {}

  @Query(() => LocationResponse)
  async findLocationById (
    @Args('id', { type: () => String }) id: string,
  ): Promise<LocationResponse> {
    return this.locationService.findById(id)
  }

  @Query(() => AirportLocationsResponse)
  async findAirportLocations (
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirportLocationsResponse> {
    return this.locationService.findAllAirportsLocation(page, limit)
  }

  @Mutation(() => LocationResponse)
  @Auth(
    Role.MANAGER,
    Role.ADMIN,
    Role.AIRLINE_MANAGER,
    Role.CREW,
    Role.FLIGHT_ATTENDANT,
    Role.GROUND_STAFF,
    Role.PASSENGER,
    Role.SECURITY,
  )
  async updateLocationForUser (
    @CurrentUser() user: CurrentUserDto,
    @Args('updateLocationInput') updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    return this.locationService.updateForUser(user.id, updateLocationInput)
  }

  @Mutation(() => LocationResponse)
  @Auth(Role.ADMIN)
  async updateLocationForAirport (
    @Args('airportId', { type: () => String }) airportId: string,
    @Args('updateLocationInput') updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    return this.locationService.updateForAirport(airportId, updateLocationInput)
  }
}
