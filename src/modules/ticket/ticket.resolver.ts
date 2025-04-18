import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { TicketService } from './ticket.service'
import { TicketResponse, TicketsResponse } from './dto/ticket.response'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { Ticket } from './entity/ticket.model'
// import { UpdateTicketInput } from './inputs/UpdateTicket.input'

@Resolver(of => Ticket)
export class TicketResolver {
  constructor (private readonly ticketService: TicketService) {}

  @Query(() => TicketsResponse)
  @Auth(Role.MANAGER)
  async getTickets (
    @Args('flightId') flightId: string,
    @Args('page', { nullable: true }) page?: number,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<TicketsResponse> {
    return this.ticketService.findAll(flightId, page, limit)
  }

  @Query(() => TicketResponse)
  @Auth(
    Role.MANAGER,
    Role.ADMIN,
    Role.AIRLINE_MANAGER,
    Role.CREW,
    Role.FLIGHT_ATTENDANT,
    Role.GROUND_STAFF,
    Role.PASSENGER,
    Role.SECURITY,
  )
  async getTicketById (@Args('id') id: string): Promise<TicketResponse> {
    return this.ticketService.findOne(id)
  }

  // @Mutation(() => TicketResponse)
  // @Auth(Role.MANAGER)
  // async updateTicket (
  //   @Args('id') id: string,
  //   @Args('updateTicketInput') updateTicketInput: UpdateTicketInput,
  //   @Args('terminal') terminal: string,
  //   @Args('gate') gate: string,
  //   @CurrentUser('id') user: CurrentUserDto,
  // ): Promise<TicketResponse> {
  //   return this.ticketService.update(
  //     id,
  //     updateTicketInput,
  //     user.id,
  //     terminal,
  //     gate,
  //   )
  // }

  @Mutation(() => TicketResponse)
  @Auth(Role.MANAGER)
  async deleteTicket (@Args('id') id: string): Promise<TicketResponse> {
    return this.ticketService.remove(id)
  }
}
