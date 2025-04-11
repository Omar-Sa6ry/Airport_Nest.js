import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { User } from 'src/modules/users/entities/user.entity'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { AirportInput } from '../input/Airport.input'
import { Airport } from '../entity/airport.model'

@Injectable()
export class AirportLoader {
  private loader: DataLoader<string, AirportInput>

  constructor (
    @InjectModel(User) private userRepo: typeof User,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, AirportInput>(
      async (keys: string[]) => {
        const airports = await this.airportRepo.findAll({
          where: { id: { [Op.in]: keys } },
        })

        const employees = await this.employeeRepo.findAll({
          where: { airportId: { [Op.in]: keys } },
        })

        const employeeMap = new Map<string, Employee[]>()
        employees.forEach(emp => {
          if (!employeeMap.has(emp.airportId)) {
            employeeMap.set(emp.airportId, [])
          }
          employeeMap.get(emp.airportId)?.push(emp)
        })

        const userIds = [...new Set(employees.map(employee => employee.userId))]
        const users = await this.userRepo.findAll({
          where: { id: { [Op.in]: userIds } },
        })
        const userMap = new Map(users.map(user => [user.id, user]))

        return keys.map(key => {
          const airport = airports.find(c => c.id === key)?.dataValues
          if (!airport)
            throw new NotFoundException(this.i18n.t('airport.NOT_FOUND'))

          const employees = employeeMap.get(key)
          if (employees.length === 0)
            throw new NotFoundException(this.i18n.t('employee.NOT_FOUND'))

          const enrichedEmployees = employees.map(emp => {
            const user = userMap.get(emp.userId)
            if (!user) {
              throw new NotFoundException(this.i18n.t('user.NOT_FOUND'))
            }

            return {
              ...emp.dataValues,
              ...user.dataValues,
            }
          })

          return { airport, employees: enrichedEmployees }
        })
      },
    )
  }

  load (id: string): Promise<AirportInput> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<AirportInput[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(
      result => !(result instanceof Error),
    ) as AirportInput[]
  }
}
