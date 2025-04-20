import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { TicketService } from './ticket.service'
import { TicketResponse, TicketsResponse } from './dto/ticket.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role, Permission } from 'src/common/constant/enum.constant'
import { Ticket } from './entity/ticket.model'

@Resolver(of => Ticket)
export class TicketResolver {
  constructor (private readonly ticketService: TicketService) {}

  @Query(() => TicketsResponse)
  @Auth([Role.MANAGER], [Permission.TICKET_ALL_VIEW])
  async getTickets (
    @Args('flightId') flightId: string,
    @Args('page', { nullable: true }) page?: number,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<TicketsResponse> {
    return this.ticketService.findAll(flightId, page, limit)
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

  // @Mutation(() => TicketResponse)
  // @Auth([Role.MANAGER], [Permission.TICKET_UPDATE])
  // async updateTicket (
  //   @Args('id') id: string,
  //   @Args('ticketInput') ticketInput: UpdateTicketInput,
  // ): Promise<TicketResponse> {
  //   return this.ticketService.update(id, ticketInput)
  // }

  @Mutation(() => TicketResponse)
  @Auth([Role.MANAGER], [Permission.TICKET_DELETE])
  async deleteTicket (@Args('id') id: string): Promise<TicketResponse> {
    return this.ticketService.remove(id)
  }
}
