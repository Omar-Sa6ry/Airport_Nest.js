import { FlightService } from './flight.service'
import { Flight } from './entity/flight.model'
import { CreateFlightInput } from './inputs/CreateFlight.input'
import { FlightOptinalInput } from './inputs/FlightOptinals.input'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { FlightOutput, FlightResponse } from './dtos/Flight.response'
import { FlightsFromAirportResponse } from './dtos/FlightsFromAirport.response'
import { FlightsToAirportResponse } from './dtos/FlightsToAirport.response'
import { FlightCrewService } from '../flightCrew/flightCrew.service'
import { FllghtCrewsData } from '../flightCrew/dtos/FlightCrews.response'
import { SeatService } from '../seat/seat.service'
import { Seat } from '../seat/entity/seat.model'
import { RedisService } from 'src/common/redis/redis.service'
import { Airline } from '../airline/entity/airline.model'
import { TicketService } from '../ticket/ticket.service'
import { Ticket } from '../ticket/entity/ticket.model'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { AirlineService } from '../airline/airline.service'
import { AirportService } from '../airport/airport.service'
import { GateService } from '../gate/gate.service'
import { Airport } from '../airport/entity/airport.model'
import { GateData } from '../gate/dto/Gate.response'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'

@Resolver(() => FlightOutput)
export class FlightResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly ticketService: TicketService,
    private readonly airlineService: AirlineService,
    private readonly airportService: AirportService,
    private readonly gateService: GateService,
    private readonly flightCrewService: FlightCrewService,
    private readonly seatService: SeatService,
    private readonly flightService: FlightService,
  ) {}

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_CREATE])
  async createFlight (
    @CurrentUser() user: CurrentUserDto,
    @Args('createFlightInput') createFlightInput: CreateFlightInput,
  ): Promise<FlightResponse> {
    return this.flightService.create(createFlightInput, user.id)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_DELETE])
  async deleteFlight (@Args('id') id: string): Promise<FlightResponse> {
    return this.flightService.delete(id)
  }

  @Query(() => FlightResponse)
  async getFlightById (@Args('id') id: string): Promise<FlightResponse> {
    const cachedFlight = await this.redisService.get(`flight:${id}`)
    if (cachedFlight instanceof FlightResponse) return { ...cachedFlight }
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
    return this.flightService.findAllToAirport(id)
  }

  @Query(() => FlightsFromAirportResponse)
  async getAllFlightsFromAitport (
    @Args('id') id: string,
  ): Promise<FlightsFromAirportResponse> {
    return this.flightService.findAllFromAirport(id)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_UPDATE])
  async updateFlight (
    @Args('id') id: string,
    @Args('updateFlightInput') updateFlightInput: FlightOptinalInput,
  ): Promise<FlightResponse> {
    return this.flightService.update(id, updateFlightInput)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_CHANGE_GATE])
  async changeFlightGate (
    @Args('flightId') flightId: string,
    @Args('gateId') gateId: string,
  ): Promise<FlightResponse> {
    return this.flightService.changwGate(flightId, gateId)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_CANCEL])
  async cancelFlight (@Args('id') id: string): Promise<FlightResponse> {
    return this.flightService.cancleFlight(id)
  }

  @Mutation(() => FlightResponse)
  @Auth([Role.AIRLINE_MANAGER], [Permission.FLIGHT_DELAY])
  async delayFlight (
    @Args('id') id: string,
    @Args('delayTimeByMinute') delayTime: number,
  ): Promise<FlightResponse> {
    return this.flightService.delayFlight(id, delayTime)
  }

  @ResolveField(() => Airline, { nullable: true })
  async airline (@Parent() flight: Flight): Promise<Airline> {
    return (await this.airlineService.findById(flight.airlineId)).data
  }

  @ResolveField(() => Airport, { nullable: true })
  async fromAirport (@Parent() flight: Flight): Promise<Airport> {
    return (await this.airportService.findById(flight.fromAirportId)).data
  }

  @ResolveField(() => Airport, { nullable: true })
  async toAirport (@Parent() flight: Flight): Promise<Airport> {
    return (await this.airportService.findById(flight.toAirportId)).data
  }

  @ResolveField(() => GateData, { nullable: true })
  async gate (@Parent() flight: FlightOutput): Promise<GateData> {
    return (await this.gateService.findById(flight.gateId)).data
  }

  @ResolveField(() => [FllghtCrewsData], { nullable: true })
  async flightCrews (
    @Parent() flight: FlightOutput,
  ): Promise<FllghtCrewsData[]> {
    return (await this.flightCrewService.findAllForFlight(flight.id)).items
  }

  @ResolveField(() => [Ticket], { nullable: true })
  async tickets (@Parent() flight: FlightOutput): Promise<Ticket[]> {
    return (await this.ticketService.findAll(flight.id)).items
  }

  @ResolveField(() => [Seat], { nullable: true })
  async avaliableSeats (@Parent() flight: FlightOutput): Promise<Seat[]> {
    return (
      await this.seatService.findAllAvaliableInFlight({ flightId: flight.id })
    ).items
  }

  @ResolveField(() => [Seat], { nullable: true })
  async seats (@Parent() flight: FlightOutput): Promise<Seat[]> {
    return (await this.seatService.findAllInFlight(flight.id)).items
  }
}
