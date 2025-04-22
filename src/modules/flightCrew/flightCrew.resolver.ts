import { CreateFlightCrewInput } from './inputs/CreateFlightCrew.input'
import { FlightCrewResponse } from './dtos/FlightCrew.response'
import { FllghtCrewsResponse } from './dtos/FlightCrews.response'
import { FlightCrewService } from './flightCrew.service'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { FlightCrew } from './entity/flightCrew.model'
import { UserService } from '../users/users.service'
import { FlightService } from '../flight/flight.service'
import { FlightOutput } from '../flight/dtos/Flight.response'
import { User } from '../users/entities/user.entity'
import {
  Resolver,
  Mutation,
  Args,
  Query,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql'

@Resolver(() => FlightCrew)
export class FlightCrewResolver {
  constructor (
    private readonly flightCrewService: FlightCrewService,
    private readonly userService: UserService,
    private readonly flightService: FlightService,
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
    return this.flightCrewService.findById(id)
  }

  @Query(() => FllghtCrewsResponse)
  async findFlightCrewsForFlight (
    @Args('flightId', { type: () => String }) flightId: string,
  ): Promise<FllghtCrewsResponse> {
    return this.flightCrewService.findAllForFlight(flightId)
  }

  @Mutation(() => FlightCrewResponse)
  @Auth([Role.MANAGER], [Permission.FLIGHT_CREW_DELETE])
  async deleteFlightCrew (
    @Args('flightCrewId') flightCrewId: string,
  ): Promise<FlightCrewResponse> {
    return this.flightCrewService.delete(flightCrewId)
  }

  @ResolveField(() => User, { nullable: true })
  async user (@Parent() flightCrew: FlightCrew): Promise<User> {
    return await this.userService.findUserByEmployeeId(flightCrew.employeeId)
  }

  @ResolveField(() => FlightOutput, { nullable: true })
  async flight (@Parent() flightCrew: FlightCrew): Promise<FlightOutput> {
    return (await this.flightService.findById(flightCrew.flightId)).data
  }
}
