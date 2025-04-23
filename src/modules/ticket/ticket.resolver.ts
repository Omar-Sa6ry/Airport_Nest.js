import { TicketService } from './ticket.service'
import { TicketResponse, TicketsResponse } from './dtos/ticket.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission, AllRoles } from 'src/common/constant/enum.constant'
import { Ticket } from './entity/ticket.model'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CreateTicketResponse } from './dtos/CreateTicket.response'
import { SeatService } from '../seat/seat.service'
import { BaggageService } from '../baggage/baggage.service'
import { Seat } from '../seat/entity/seat.model'
import { Baggage } from '../baggage/entity/baggage.model'
import { CreateBaggageInput } from '../baggage/inputs/CreateBaggage.input'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { FlightService } from '../flight/flight.service'
import { FlightOutput } from '../flight/dtos/Flight.response'
import { SendTicketService } from 'src/common/queues/ticket/SendTicket.service'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'

@Resolver(of => Ticket)
export class TicketResolver {
  constructor (
    private readonly baggageService: BaggageService,
    private readonly flightService: FlightService,
    private readonly seatService: SeatService,
    private readonly ticketService: TicketService,
    private readonly sendTicketService: SendTicketService,
  ) {}

  @Mutation(() => CreateTicketResponse)
  @Auth(AllRoles, [Permission.TICKET_BOOK])
  async bookeTicket (
    @CurrentUser() user: CurrentUserDto,
    @Args('seatId') seatId: string,
    @Args('createBaggageInput') createBaggageInput: CreateBaggageInput,
  ): Promise<CreateTicketResponse> {
    return this.sendTicketService.create(seatId, user.id, createBaggageInput)
  }

  @Mutation(() => TicketResponse)
  @Auth(AllRoles, [Permission.TICKET_BOOK])
  async unbookeTicket (
    @CurrentUser() user: CurrentUserDto,
    @Args('ticketId') ticketId: string,
  ): Promise<TicketResponse> {
    return this.ticketService.unBook(ticketId, user.id)
  }

  @Query(() => TicketsResponse)
  @Auth([Role.MANAGER], [Permission.TICKET_ALL_VIEW])
  async getTickets (
    @Args('flightId') flightId: string,
  ): Promise<TicketsResponse> {
    return this.ticketService.findAll(flightId)
  }

  @Query(() => TicketResponse)
  @Auth(
    [
      Role.MANAGER,
      Role.ADMIN,
      Role.AIRLINE_MANAGER,
      Role.FLIGHT_ATTENDANT,
      Role.GROUND_STAFF,
      Role.PASSENGER,
      Role.SECURITY,
    ],
    [Permission.TICKET_VIEW],
  )
  async getTicketById (@Args('id') id: string): Promise<TicketResponse> {
    return this.ticketService.findOne(id)
  }

  @Mutation(() => TicketResponse)
  @Auth([Role.MANAGER], [Permission.TICKET_DELETE])
  async deleteTicket (@Args('id') id: string): Promise<TicketResponse> {
    return this.ticketService.delete(id)
  }

  @Mutation(() => TicketResponse)
  @Auth([Role.MANAGER], [Permission.TICKET_DELETE])
  async deleteExpiryAnDeleteTickets (): Promise<TicketResponse> {
    return this.ticketService.deleteExpiryAnDelete()
  }

  @ResolveField(() => Baggage)
  async baggage (@Parent() ticket: Ticket): Promise<Baggage> {
    return await this.baggageService.findByTicketId(ticket.id)
  }

  @ResolveField(() => Seat)
  async seat (@Parent() ticket: Ticket): Promise<Seat> {
    return (await this.seatService.findByIdWithoutError(ticket.seatId)).data
  }

  @ResolveField(() => FlightOutput)
  async flight (@Parent() ticket: Ticket): Promise<FlightOutput> {
    const seat = await (
      await this.seatService.findByIdWithoutError(ticket.seatId)
    ).data
    return (await this.flightService.findById(seat.flightId)).data
  }
}
