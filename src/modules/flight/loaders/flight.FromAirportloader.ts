import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Flight } from '../entity/flight.model'
import { FromAirportFlightInput } from '../inputs/FlightsFromAirport.input'

@Injectable()
export class FlightFromAirportLoader {
  private loader: DataLoader<string, FromAirportFlightInput>

  constructor (
    @InjectModel(Flight) private flightRepo: typeof Flight,
    @InjectModel(Gate) private gateRepo: typeof Gate,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, FromAirportFlightInput>(
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
          ...new Set(flights.map(flight => flight.toAirportId)),
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

          const toAirport = airportMap.get(flight.toAirportId)?.dataValues
          if (!toAirport)
            throw new NotFoundException(this.i18n.t('airport.NOT_FOUND'))

          const gate = gateMap.get(flight.gateId)?.dataValues
          if (!gate) throw new NotFoundException(this.i18n.t('gate.NOT_FOUND'))

          return { ...flight, toAirport, gate }
        })
      },
    )
  }

  load (id: string): Promise<FromAirportFlightInput> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<FromAirportFlightInput[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(
      result => !(result instanceof Error),
    ) as FromAirportFlightInput[]
  }
}
