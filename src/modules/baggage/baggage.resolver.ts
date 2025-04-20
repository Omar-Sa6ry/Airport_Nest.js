import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql'
import { BaggageService } from './baggage.service'
import { UpdateBaggageInput } from './inputs/UpdateBaggage.input'
import { BaggageResponse } from './dto/Baggage.response'
import { BaggagesResponse } from './dto/Baggage.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'

@Resolver()
export class BaggageResolver {
  constructor (private readonly baggageService: BaggageService) {}

  @Query(() => BaggageResponse)
  @Auth(Role.MANAGER, Role.PASSENGER)
  async findBaggageById (
    @Args('id', { type: () => String }) id: string,
  ): Promise<BaggageResponse> {
    return this.baggageService.findById(id)
  }

  @Query(() => BaggagesResponse)
  @Auth(Role.MANAGER)
  async findAllBaggageOnFlight (
    @Args('flightId', { type: () => String }) flightId: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<BaggagesResponse> {
    return this.baggageService.findAllBaggageOnFlight(flightId, page, limit)
  }

  @Mutation(() => BaggageResponse)
  @Auth(Role.PASSENGER)
  async updateBaggage (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => String }) id: string,
    @Args('updateBaggageInput') updateBaggageInput: UpdateBaggageInput,
  ): Promise<BaggageResponse> {
    return this.baggageService.update(id, user.id, updateBaggageInput)
  }

  @Mutation(() => BaggageResponse)
  @Auth(Role.MANAGER)
  async deleteBaggage (
    @Args('id', { type: () => String }) id: string,
  ): Promise<BaggageResponse> {
    return this.baggageService.delete(id)
  }
}
