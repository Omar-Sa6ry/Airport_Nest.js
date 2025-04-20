import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { LocationService } from './location.service'
import { LocationResponse } from './dtos/location.response'
import { UpdateLocationInput } from './inputs/UpdateLocation.input copy'
import { AirportLocationsResponse } from './dtos/LocationsAirport.response'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { AirlineLocationsResponse } from './dtos/LocationsAirline.response'

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

  @Query(() => AirlineLocationsResponse)
  async findAirlineLocations (
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<AirlineLocationsResponse> {
    return this.locationService.findAllAilinesLocation(page, limit)
  }

  @Mutation(() => LocationResponse)
  @Auth(
    [
      Role.MANAGER,
      Role.ADMIN,
      Role.AIRLINE_MANAGER,
      Role.FLIGHT_ATTENDANT,
      Role.GROUND_STAFF,
      Role.PASSENGER,
      Role.SECURITY,
    ],
    [Permission.LOCATION_UPDATE_SELF],
  )
  async updateLocationForUser (
    @CurrentUser() user: CurrentUserDto,
    @Args('updateLocationInput') updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    return this.locationService.updateForUser(user.id, updateLocationInput)
  }

  @Mutation(() => LocationResponse)
  @Auth([Role.ADMIN], [Permission.LOCATION_UPDATE_AIRLINE])
  async updateLocationForAirline (
    @Args('airlineId', { type: () => String }) airlineId: string,
    @Args('updateLocationInput') updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    return this.locationService.updateForAirline(airlineId, updateLocationInput)
  }

  @Mutation(() => LocationResponse)
  @Auth([Role.ADMIN], [Permission.LOCATION_UPDATE_AIRPORT])
  async updateLocationForAirport (
    @Args('airportId', { type: () => String }) airportId: string,
    @Args('updateLocationInput') updateLocationInput: UpdateLocationInput,
  ): Promise<LocationResponse> {
    return this.locationService.updateForAirport(airportId, updateLocationInput)
  }
}
