import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { User } from 'src/modules/users/entities/user.entity'
import { StaffsData } from '../dtos/Staffs.response'
import { Staff } from '../entity/flightCrew.model'

@Injectable()
export class SatffDataLoader {
  private loader: DataLoader<string, StaffsData>

  constructor (
    @InjectModel(Staff) private flightCrewepo: typeof Staff,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
    @InjectModel(User) private userRepo: typeof User,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, StaffsData>(async (keys: string[]) => {
      const flightCrews = await this.flightCrewepo.findAll({
        where: { id: { [Op.in]: keys } },
      })

      const employeeIds = [
        ...new Set(flightCrews.map(flightCrew => flightCrew.employeeId)),
      ]
      const employees = await this.employeeRepo.findAll({
        where: { id: { [Op.in]: employeeIds } },
      })
      const employeeMap = new Map(
        employees.map(employee => [employee.id, employee]),
      )

      const userIds = [...new Set(employees.map(employee => employee.userId))]
      const users = await this.userRepo.findAll({
        where: { id: { [Op.in]: userIds } },
      })
      const userMap = new Map(users.map(user => [user.id, user]))

      return keys.map(key => {
        const flightCrew = flightCrews.find(c => c.id === key)
        if (!flightCrew)
          throw new NotFoundException(this.i18n.t('flightCrew.NOT_FOUND'))

        const employee = employeeMap.get(flightCrew.employeeId)
        if (!employee)
          throw new NotFoundException(this.i18n.t('employee.NOT_FOUND'))

        const user = userMap.get(employee.userId)
        if (!user) throw new NotFoundException(this.i18n.t('user.NOT_FOUND'))

        return { ...flightCrew.dataValues, user: user.dataValues }
      })
    })
  }

  load (id: string): Promise<StaffsData> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<StaffsData[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter((r): r is StaffsData => !(r instanceof Error))
  }
}
