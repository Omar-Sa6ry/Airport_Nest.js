import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { Baggage } from '../entity/baggage.model'
import { Ticket } from 'src/modules/ticket/entity/ticket.model'
import { BaggageData } from '../dto/Baggage.response'
import { I18nService } from 'nestjs-i18n'

@Injectable()
export class BaggageLoader {
  private loader: DataLoader<string, BaggageData>

  constructor (
    @InjectModel(Ticket) private ticketRepo: typeof Ticket,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
    @InjectModel(Baggage) private baggageRepo: typeof Baggage,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, BaggageData>(
      async (keys: string[]) => {
        const baggeges = await this.baggageRepo.findAll({
          where: { ticketId: { [Op.in]: keys } },
        })

        const ticketIds = [
          ...new Set(baggeges.map(baggage => baggage.ticketId)),
        ]
        const tickets = await this.ticketRepo.findAll({
          where: { id: { [Op.in]: ticketIds } },
        })
        const ticketMap = new Map(tickets.map(ticket => [ticket.id, ticket]))

        return keys.map(key => {
          const baggage = baggeges.find(c => c.id === key)?.dataValues
          if (!baggage)
            throw new NotFoundException(this.i18n.t('baggage.NOT_FOUND'))

          const ticket = ticketMap.get(baggage.ticketId)
          if (!ticket)
            throw new NotFoundException(this.i18n.t('ticket.NOT_FOUND'))

          return { ...baggage.dataValues, ticket: ticket.dataValues }
        })
      },
    )
  }

  load (id: string): Promise<BaggageData> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<BaggageData[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(result => !(result instanceof Error)) as BaggageData[]
  }
}
