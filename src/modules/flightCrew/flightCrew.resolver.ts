import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql'
import { CreateFlightCrewInput } from './inputs/CreateFlightCrew.input'
import { FlightCrewData, FlightCrewResponse } from './dtos/FlightCrew.response'
import { FllghtCrewsResponse } from './dtos/FlightCrews.response'
import { FlightCrewService } from './flightCrew.service'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'

@Resolver()
export class FlightCrewResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly flightCrewService: FlightCrewService,
  ) {}

  @Mutation(() => FlightCrewResponse)
  @Auth([Role.MANAGER], [Permission.FLIGHT_CREW_CREATE])
  async createFlightCrew (
    @Args('createFlightCrewInput') createFlightCrewInput: CreateFlightCrewInput,
  ): Promise<FlightCrewResponse> {
    return this.flightCrewService.create(createFlightCrewInput)
  }

  @Query(() => FlightCrewResponse)
  async findFlightCrewById (
    @Args('id', { type: () => String }) id: string,
  ): Promise<FlightCrewResponse> {
    const cachedFlightCrew = await this.redisService.get(`flightCrew:${id}`)
    if (cachedFlightCrew instanceof FlightCrewData) {
      return { data: cachedFlightCrew }
    }

    return this.flightCrewService.findById(id)
  }

  @Query(() => FllghtCrewsResponse)
  async findFlightCrewsForFlight (
    @Args('flightId', { type: () => String }) flightId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<FllghtCrewsResponse> {
    return this.flightCrewService.findAllForFlight(flightId, page, limit)
  }

  @Mutation(() => FlightCrewResponse)
  @Auth([Role.MANAGER], [Permission.FLIGHT_CREW_DELETE])
  async deleteFlightCrew (
    @Args('flightCrewId') flightCrewId: string,
  ): Promise<FlightCrewResponse> {
    return this.flightCrewService.delete(flightCrewId)
  }
}
