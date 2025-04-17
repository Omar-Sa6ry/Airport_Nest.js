import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { FlightService } from './flight.service'
import { Flight } from './entity/flight.model'
import { CreateFlightInput } from './inputs/CreateFlight.input'
import { FlightOptinalInput } from './inputs/FlightOptinals.input'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { FlightResponse } from './dtos/Flight.response'
import { FlightsFromAirportResponse } from './dtos/FlightsFromAirport.response'
import { FlightsToAirportResponse } from './dtos/FlightsToAirport.response'
import { RedisService } from 'src/common/redis/redis.service'

@Resolver(() => Flight)
export class FlightResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly flightService: FlightService,
  ) {}

  @Mutation(() => FlightResponse)
  @Auth(Role.MANAGER)
  async createFlight (
    @Args('createFlightInput') createFlightInput: CreateFlightInput,
  ): Promise<FlightResponse> {
    return this.flightService.create(createFlightInput)
  }

  @Mutation(() => FlightResponse)
  @Auth(Role.MANAGER)
  async deleteFlight (@Args('id') id: string): Promise<FlightResponse> {
    return this.flightService.delete(id)
  }

  @Query(() => FlightResponse)
  async getFlightById (@Args('id') id: string): Promise<FlightResponse> {
    const cachedFlight = await this.redisService.get(`flight:${id}`)

    if (cachedFlight instanceof FlightResponse) {
      return { ...cachedFlight }
    }

    return this.flightService.findById(id)
  }

  @Query(() => FlightResponse)
  async getFlightByData (
    @Args('findOptions') findOptions: FlightOptinalInput,
  ): Promise<FlightResponse> {
    return this.flightService.findByData(findOptions)
  }

  @Query(() => FlightsToAirportResponse)
  async getAllFlightsToAitport (
    @Args('id') id: string,
  ): Promise<FlightsToAirportResponse> {
    return await this.flightService.findAllToAirport(id)
  }

  @Query(() => FlightsFromAirportResponse)
  async getAllFlightsFromAitport (
    @Args('id') id: string,
  ): Promise<FlightsFromAirportResponse> {
    return this.flightService.findAllFromAirport(id)
  }

  @Mutation(() => FlightResponse)
  @Auth(Role.MANAGER)
  async updateFlight (
    @Args('id') id: string,
    @Args('updateFlightInput') updateFlightInput: FlightOptinalInput,
  ): Promise<FlightResponse> {
    return this.flightService.update(id, updateFlightInput)
  }

  @Mutation(() => FlightResponse)
  @Auth(Role.MANAGER)
  async changeFlightGate (
    @Args('flightId') flightId: string,
    @Args('gateId') gateId: string,
  ): Promise<FlightResponse> {
    return this.flightService.changwGate(flightId, gateId)
  }

  @Mutation(() => FlightResponse)
  @Auth(Role.MANAGER)
  async cancelFlight (@Args('id') id: string): Promise<FlightResponse> {
    return this.flightService.cancleFlight(id)
  }

  @Mutation(() => FlightResponse)
  @Auth(Role.MANAGER)
  async delayFlight (
    @Args('id') id: string,
    @Args('delayTime') delayTime: number,
  ): Promise<FlightResponse> {
    return this.flightService.delayFlight(id, delayTime)
  }
}
