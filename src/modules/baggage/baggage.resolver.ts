import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql'
import { BaggageService } from './baggage.service'
import { UpdateBaggageInput } from './inputs/UpdateBaggage.input'
import { BaggageResponse, BaggagesResponse } from './dto/Baggage.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'

@Resolver()
export class BaggageResolver {
  constructor (private readonly baggageService: BaggageService) {}

  @Query(() => BaggageResponse)
  @Auth([Role.SECURITY, Role.PASSENGER], [Permission.BAGGAGE_READ])
  async findBaggageById (
    @Args('id', { type: () => String }) id: string,
  ): Promise<BaggageResponse> {
    return this.baggageService.findById(id)
  }

  @Query(() => BaggagesResponse)
  @Auth([Role.SECURITY], [Permission.BAGGAGE_READ_ALL])
  async findAllBaggageOnFlight (
    @Args('flightId', { type: () => String }) flightId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<BaggagesResponse> {
    return this.baggageService.findAllBaggageOnFlight(flightId, page, limit)
  }

  @Mutation(() => BaggageResponse)
  @Auth([Role.PASSENGER], [Permission.BAGGAGE_UPDATE])
  async updateBaggage (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => String }) id: string,
    @Args('updateBaggageInput') updateBaggageInput: UpdateBaggageInput,
  ): Promise<BaggageResponse> {
    return this.baggageService.update(id, user.id, updateBaggageInput)
  }

  @Mutation(() => BaggageResponse)
  @Auth([Role.MANAGER, Role.PASSENGER], [Permission.BAGGAGE_DELETE])
  async deleteBaggage (
    @Args('id', { type: () => String }) id: string,
  ): Promise<BaggageResponse> {
    return this.baggageService.delete(id)
  }
}
