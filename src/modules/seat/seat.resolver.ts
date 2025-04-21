import { SeatService } from './seat.service'
import { Seat } from './entity/seat.model'
import { CreateSeatInput } from './inputs/CreateSeat.input'
import { UpdateSeatInput } from './inputs/UpdateSeat.input'
import { FindSeatInput } from './inputs/FindSeat.input'
import { SeatResponse, SeatsResponse } from './dto/Seat.response'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { FlightOutput } from '../flight/dtos/Flight.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Permission, Role } from 'src/common/constant/enum.constant'
import { FlightService } from '../flight/flight.service'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql'

@Resolver(() => Seat)
export class SeatResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly seatService: SeatService,
    private readonly flightService: FlightService,
  ) {}

  @Mutation(() => SeatResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.SEAT_CREATE])
  async createSeat (
    @Args('createSeatInput') createSeatInput: CreateSeatInput,
  ): Promise<SeatResponse> {
    return this.seatService.create(createSeatInput)
  }

  @Query(() => SeatResponse)
  async findSeatById (
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SeatResponse> {
    const cachedSeat = await this.redisService.get(`seat:${id}`)

    if (cachedSeat instanceof SeatResponse) {
      return cachedSeat
    }

    return this.seatService.findById(id)
  }

  @Query(() => SeatsResponse)
  async findAllAvailableSeatsInFlight (
    @Args('findSeatInput') findSeatInput: FindSeatInput,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<SeatsResponse> {
    return this.seatService.findAllAvaliableInFlight(findSeatInput, page, limit)
  }

  @Mutation(() => SeatResponse)
  @Auth([Role.PASSENGER], [Permission.SEAT_BOOK])
  async bookSeat (
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SeatResponse> {
    return this.seatService.bookSeat(id)
  }

  @Mutation(() => SeatResponse)
  @Auth([Role.PASSENGER], [Permission.SEAT_UNBOOK])
  async unBookSeat (
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SeatResponse> {
    return this.seatService.unBookSeat(id)
  }

  @Mutation(() => SeatResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.SEAT_UPDATE])
  async updateSeat (
    @Args('id', { type: () => ID }) id: string,
    @Args('updateSeatInput') updateSeatInput: UpdateSeatInput,
  ): Promise<SeatResponse> {
    return this.seatService.update(id, updateSeatInput)
  }

  @Mutation(() => SeatsResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.SEAT_UPDATE])
  async makeSeatsAvaliableInFlight (
    @CurrentUser() user: CurrentUserDto,
    @Args('flightId', { type: () => ID }) id: string,
  ): Promise<SeatsResponse> {
    return this.seatService.makeSeatsAvaliableInFlight(id, user.id)
  }

  @Mutation(() => SeatResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.SEAT_DELETE])
  async deleteSeat (
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SeatResponse> {
    return this.seatService.delete(id)
  }

  @ResolveField(() => FlightOutput, { nullable: true })
  async flight (@Parent() seat: Seat): Promise<FlightOutput> {
    return (await this.flightService.findById(seat.flightId)).data
  }
}
