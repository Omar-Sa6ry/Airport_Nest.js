import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Gate } from 'src/modules/gate/entity/gate.model'
import { Flight } from '../entity/flight.model'
import { ToAirportFlightOutput } from '../dtos/FlightsToAirport.response'
import { Airline } from 'src/modules/airline/entity/airline.model'

@Injectable()
export class FlightToAirportLoader {
  private loader: DataLoader<string, ToAirportFlightOutput>

  constructor (
    @InjectModel(Airline) private airlineRepo: typeof Airline,
    @InjectModel(Flight) private flightRepo: typeof Flight,
    @InjectModel(Gate) private gateRepo: typeof Gate,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, ToAirportFlightOutput>(
      async (keys: string[]) => {
        const flights = await this.flightRepo.findAll({
          where: { id: { [Op.in]: keys } },
        })

        const gateIds = [...new Set(flights.map(flight => flight.gateId))]
        const gates = await this.gateRepo.findAll({
          where: { id: { [Op.in]: gateIds } },
        })
        const gateMap = new Map(gates.map(gate => [gate.id, gate]))

        const airlineIds = [...new Set(flights.map(flight => flight.airlineId))]
        const airlines = await this.airlineRepo.findAll({
          where: { id: { [Op.in]: airlineIds } },
        })
        const airlineMap = new Map(
          airlines.map(airline => [airline.id, airline]),
        )

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
          const flight = flights.find(c => c.id === key)
          if (!flight)
            throw new NotFoundException(this.i18n.t('flight.NOT_FOUND'))

          const fromAirport = airportMap.get(flight.fromAirportId)
          if (!fromAirport)
            throw new NotFoundException(this.i18n.t('airport.NOT_FOUND'))

          const gate = gateMap.get(flight.gateId)
          if (!gate) throw new NotFoundException(this.i18n.t('gate.NOT_FOUND'))

          const airline = airlineMap.get(flight.airlineId)?.dataValues
          if (!airline)
            throw new NotFoundException(this.i18n.t('airline.NOT_FOUND'))

          return {
            ...flight.dataValues,
            airline,
            fromAirport: fromAirport.dataValues,
            gate: gate.dataValues,
          }
        })
      },
    )
  }

  load (id: string): Promise<ToAirportFlightOutput> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<ToAirportFlightOutput[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(
      result => !(result instanceof Error),
    ) as ToAirportFlightOutput[]
  }
}
