import { CreateAirportCrewInput } from '../inputs/CreateAirportCrew.input'
import { AirportCrewService } from './airportCrew.service'
import { StaffResponse } from '../dtos/Staff.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { AirportService } from 'src/modules/airport/airport.service'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { UserService } from '../../users/users.service'
import { Staff } from '../entity/flightCrew.model'
import { Airport } from '../../airport/entity/airport.model'
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
export class AirportCrewResolver {
  constructor (
    private readonly AirportCrewService: AirportCrewService,
    private readonly userService: UserService,
    private readonly airportService: AirportService,
  ) {}

  @Mutation(() => StaffResponse)
  @Auth([Role.MANAGER], [Permission.AIRPORT_CREW_CREATE])
  async createAirportCrew (
    @Args('createAirportCrewInput')
    createAirportCrewInput: CreateAirportCrewInput,
  ): Promise<StaffResponse> {
    return this.AirportCrewService.create(createAirportCrewInput)
  }

  @Query(() => StaffResponse)
  async findAirportCrewById (
    @Args('id', { type: () => String }) id: string,
  ): Promise<StaffResponse> {
    return this.AirportCrewService.findById(id)
  }

  @Mutation(() => StaffResponse)
  @Auth([Role.MANAGER], [Permission.AIRPORT_CREW_DELETE])
  async deleteAirportCrew (
    @Args('AirportCrewId') AirportCrewId: string,
  ): Promise<StaffResponse> {
    return this.AirportCrewService.delete(AirportCrewId)
  }

  @ResolveField(() => User, { nullable: true })
  async user (@Parent() staff: Staff): Promise<User> {
    return await this.userService.findUserByEmployeeId(staff.employeeId)
  }

  @ResolveField(() => Airport, { nullable: true })
  async airport (@Parent() staff: Staff): Promise<Airport> {
    return (await this.airportService.findById(staff.airportId)).data
  }
}
