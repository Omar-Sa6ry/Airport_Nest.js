import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Ticket } from './entity/ticket.model'
import { I18nService } from 'nestjs-i18n'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { TicketResponse, TicketsResponse } from './dto/ticket.response'

@Injectable()
export class TicketService {
  constructor (
    private readonly i18n: I18nService,
    @InjectModel(Ticket) private readonly ticketModel: typeof Ticket,
  ) {}

  async findAll (
    flightId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<TicketsResponse> {
    const { rows: tickets, count: total } =
      await this.ticketModel.findAndCountAll({
        where: { flightId },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      })
    if (tickets.length === 0)
      throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))

    return {
      items: tickets.map(t => t.dataValues),
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne (id: string): Promise<TicketResponse> {
    const ticket = await this.ticketModel.findByPk(id)
    if (!ticket)
      throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))
    return { data: ticket.dataValues }
  }

  // async update (
  //   id: string,
  //   updateTicketInput: UpdateTicketInput,
  //   userId: string,
  //   terminal: string,
  //   gate: string,
  // ): Promise<TicketResponse> {
  //   return this.sendTicketService.update(
  //     id,
  //     updateTicketInput,
  //     userId,
  //     terminal,
  //     gate,
  //   )
  // }

  async remove (id: string): Promise<TicketResponse> {
    const ticket = await this.ticketModel.findByPk(id)
    if (!ticket)
      throw new NotFoundException(await this.i18n.t('ticket.NOT_FOUND'))

    await ticket.destroy()
    return { data: null, message: await this.i18n.t('ticket.DELETED') }
  }
}
