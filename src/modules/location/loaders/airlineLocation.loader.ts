import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { Location } from '../entity/location.model'
import { Airline } from 'src/modules/airline/entity/airline.model'
import { AirlineLocation } from '../dtos/LocationsAirline.response'

@Injectable()
export class AirlineLocationLoader {
  private loader: DataLoader<string, AirlineLocation>

  constructor (
    @InjectModel(Location) private locationRepo: typeof Location,
    @InjectModel(Airline) private airlineRepo: typeof Airline,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, AirlineLocation>(
      async (keys: string[]) => {
        const locations = await this.locationRepo.findAll({
          where: { id: { [Op.in]: keys } },
        })

        const airlineIds = [
          ...new Set(locations.map(location => location.airlineId)),
        ]
        const airlines = await this.airlineRepo.findAll({
          where: { id: { [Op.in]: airlineIds } },
        })
        const airlineMap = new Map(
          airlines.map(airline => [airline.id, airline]),
        )

        return keys.map(key => {
          const location = locations.find(c => c.id === key)
          if (!location)
            throw new NotFoundException(this.i18n.t('location.NOT_FOUND'))

          const airline = airlineMap.get(location.airlineId)
          if (!airline)
            throw new NotFoundException(this.i18n.t('airline.NOT_FOUND'))

          return {
            ...location.dataValues,
            airline: airline.dataValues,
          }
        })
      },
    )
  }

  load (id: string): Promise<AirlineLocation> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<AirlineLocation[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter((r): r is AirlineLocation => !(r instanceof Error))
  }
}
