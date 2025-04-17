import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Flight } from '../entity/flight.model'
import { ToAirportFlightInput } from '../inputs/FlightsToAirport.response'

@Injectable()
export class FlightToAirportLoader {
  private loader: DataLoader<string, ToAirportFlightInput>

  constructor (
    @InjectModel(Flight) private flightRepo: typeof Flight,
    @InjectModel(Gate) private gateRepo: typeof Gate,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, ToAirportFlightInput>(
      async (keys: string[]) => {
        const flights = await this.flightRepo.findAll({
          where: { id: { [Op.in]: keys } },
        })

        const gateIds = [...new Set(flights.map(flight => flight.gateId))]
        const gates = await this.gateRepo.findAll({
          where: { id: { [Op.in]: gateIds } },
        })
        const gateMap = new Map(gates.map(gate => [gate.id, gate]))

        const airportIds = [
          ...new Set(flights.map(flight => flight.fromAirportId)),
        ]
        const airports = await this.airportRepo.findAll({
          where: { id: { [Op.in]: airportIds } },
        })
        const airportMap = new Map(
          airports.map(airport => [airport.id, airport]),
        )

        return keys.map(key => {
          const flight = flights.find(c => c.id === key)?.dataValues
          if (!flight)
            throw new NotFoundException(this.i18n.t('airport.NOT_FOUND'))

          const fromAirport = airportMap.get(flight.fromAirportId)?.dataValues
          if (!fromAirport)
            throw new NotFoundException(this.i18n.t('airport.NOT_FOUND'))

          const gate = gateMap.get(flight.gateId)?.dataValues
          if (!gate) throw new NotFoundException(this.i18n.t('gate.NOT_FOUND'))

          return { ...flight, fromAirport, gate }
        })
      },
    )
  }

  load (id: string): Promise<ToAirportFlightInput> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<ToAirportFlightInput[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(
      result => !(result instanceof Error),
    ) as ToAirportFlightInput[]
  }
}
