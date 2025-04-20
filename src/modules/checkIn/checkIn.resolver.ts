import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { CheckInService } from './checkin.service'
import { CreateCheckInInput } from './inputs/CreateCheckIn.input'
import { CreateTicketInput } from '../ticket/inputs/CreateTicket.input'
import { CheckinResponse, CheckinsResponse } from './dtos/CheckIn.response'
import { Currency, Role, Permission } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CreateCheckinResponse } from './dtos/CreateCheckIn.respons'
import { CreateBagInput } from './inputs/CreateBaggage.input'

@Resolver()
export class CheckInResolver {
  constructor (private readonly checkInService: CheckInService) {}

  @Mutation(() => CreateCheckinResponse)
  @Auth([Role.PASSENGER], [Permission.CHECKIN_CREATE])
  async createCheckIn (
    @CurrentUser() user: CurrentUserDto,
    @Args('createCheckInInput') createCheckInInput: CreateCheckInInput,
    @Args('createTicketInput') createTicketInput: CreateTicketInput,
    @Args('createBagInput') createBagInput: CreateBagInput,
    @Args('currency', { type: () => Currency }) currency: Currency,
  ): Promise<CreateCheckinResponse> {
    return this.checkInService.create(
      createCheckInInput,
      createTicketInput,
      createBagInput,
      currency,
      user?.id,
      user?.email,
    )
  }

  @Query(() => CheckinsResponse)
  @Auth([Role.MANAGER, Role.ADMIN], [Permission.CHECKIN_READ])
  async getAllCheckIns (
    @Args('page', { type: () => Number, nullable: true }) page?: number,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ): Promise<CheckinsResponse> {
    return this.checkInService.findAll(page, limit)
  }

  @Query(() => CheckinResponse)
  @Auth([Role.PASSENGER], [Permission.CHECKIN_READ_OWN])
  async getCheckInForUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CheckinResponse> {
    return this.checkInService.findById(user.id)
  }

  @Query(() => CheckinResponse)
  @Auth([Role.MANAGER, Role.ADMIN], [Permission.CHECKIN_READ])
  async getCheckInById (@Args('id') id: string): Promise<CheckinResponse> {
    return this.checkInService.findById(id)
  }

  @Mutation(() => CheckinResponse)
  @Auth([Role.MANAGER, Role.ADMIN], [Permission.CHECKIN_DELETE])
  async deleteCheckIn (@Args('id') id: string): Promise<CheckinResponse> {
    return this.checkInService.delete(id)
  }
}
