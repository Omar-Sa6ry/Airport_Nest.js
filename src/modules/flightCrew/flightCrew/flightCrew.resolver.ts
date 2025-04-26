import { CreateFlightCrewInput } from '../inputs/CreateFlightCrew.input'
import { FlightCrewService } from './flightCrew.service'
import { Staff } from '../entity/flightCrew.model'
import { StaffResponse } from '../dtos/Staff.response'
import { StaffsResponse } from '../dtos/Staffs.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { UserService } from '../../users/users.service'
import { FlightService } from '../../flight/flight.service'
import { FlightOutput } from '../../flight/dtos/Flight.response'
import { User } from '../../users/entities/user.entity'
import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql'

@Resolver(() => Staff)
export class FlightCrewResolver {
  constructor (
    private readonly flightCrewService: FlightCrewService,
    private readonly userService: UserService,
    private readonly flightService: FlightService,
  ) {}

  @Mutation(() => StaffResponse)
  @Auth([Role.MANAGER], [Permission.FLIGHT_CREW_CREATE])
  async createFlightCrew (
    @Args('createFlightCrewInput') createFlightCrewInput: CreateFlightCrewInput,
  ): Promise<StaffResponse> {
    return this.flightCrewService.create(createFlightCrewInput)
  }

  @Query(() => StaffResponse)
  async findFlightCrewById (
    @Args('id', { type: () => String }) id: string,
  ): Promise<StaffResponse> {
    return this.flightCrewService.findById(id)
  }

  @Query(() => StaffsResponse)
  async findFlightCrewsForFlight (
    @Args('flightId', { type: () => String }) flightId: string,
  ): Promise<StaffsResponse> {
    return this.flightCrewService.findAllForFlight(flightId)
  }

  @Mutation(() => StaffResponse)
  @Auth([Role.MANAGER], [Permission.FLIGHT_CREW_DELETE])
  async deleteFlightCrew (
    @Args('flightCrewId') flightCrewId: string,
  ): Promise<StaffResponse> {
    return this.flightCrewService.delete(flightCrewId)
  }

  @ResolveField(() => User, { nullable: true })
  async user (@Parent() staff: Staff): Promise<User> {
    return await this.userService.findUserByEmployeeId(staff.employeeId)
  }

  @ResolveField(() => FlightOutput, { nullable: true })
  async flight (@Parent() staff: Staff): Promise<FlightOutput> {
    return (await this.flightService.findById(staff.flightId)).data
  }
}
