import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { Location } from '../entity/location.model'
import { AirportLocation } from '../dtos/LocationsAirport.response'

@Injectable()
export class AirportLocationLoader {
  private loader: DataLoader<string, AirportLocation>

  constructor (
    @InjectModel(Location) private locationRepo: typeof Location,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, AirportLocation>(
      async (keys: string[]) => {
        const locations = await this.locationRepo.findAll({
          where: { id: { [Op.in]: keys } },
        })

        const airportIds = [
          ...new Set(locations.map(location => location.airportId)),
        ]
        const airports = await this.airportRepo.findAll({
          where: { id: { [Op.in]: airportIds } },
        })
        const airportMap = new Map(
          airports.map(airport => [airport.id, airport]),
        )

        return keys.map(key => {
          const location = locations.find(c => c.id === key)
          if (!location)
            throw new NotFoundException(this.i18n.t('location.NOT_FOUND'))

          const airport = airportMap.get(location.airportId)
          if (!airport)
            throw new NotFoundException(this.i18n.t('airport.NOT_FOUND'))

          return {
            ...location.dataValues,
            airport: airport.dataValues,
          }
        })
      },
    )
  }

  load (id: string): Promise<AirportLocation> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<AirportLocation[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(result => !(result instanceof Error)) as Location[]
  }
}
