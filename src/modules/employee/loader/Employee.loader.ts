import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { EmployeeInput } from 'src/modules/employee/input/Employee.input'
import { User } from 'src/modules/users/entities/user.entity'
import { Employee } from 'src/modules/employee/entity/employee.model'
import { Airport } from 'src/modules/airport/entity/airport.model'

@Injectable()
export class EmployeeLoader {
  private loader: DataLoader<string, EmployeeInput>

  constructor (
    @InjectModel(User) private userRepo: typeof User,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, EmployeeInput>(
      async (keys: string[]) => {
        const employees = await this.employeeRepo.findAll({
          where: { id: { [Op.in]: keys } },
        })

        const airportIds = [
          ...new Set(employees.map(employee => employee.airportId)),
        ]
        const airports = await this.airportRepo.findAll({
          where: { id: { [Op.in]: airportIds } },
        })
        const airportMap = new Map(
          airports.map(airport => [airport.id, airport]),
        )

        const employeesInAirport = await this.employeeRepo.findAll({
          where: { airportId: { [Op.in]: airportIds } },
        })
        const employeeMap = new Map<string, Employee[]>()
        employeesInAirport.forEach(emp => {
          if (!employeeMap.has(emp.airportId)) {
            employeeMap.set(emp.airportId, [])
          }
          employeeMap.get(emp.airportId)?.push(emp)
        })

        const userIds = [
          ...new Set(employees.map(employee => employee.userId)),
          ...new Set(employeesInAirport.map(employee => employee.userId)),
        ]
        const users = await this.userRepo.findAll({
          where: { id: { [Op.in]: userIds } },
        })
        const userMap = new Map(users.map(user => [user.id, user]))

        return keys.map(key => {
          const employee = employees.find(c => c.id === key)
          if (!employee)
            throw new NotFoundException(this.i18n.t('employee.NOT_FOUND'))

          const user = userMap.get(employee.userId)
          if (!user) throw new NotFoundException(this.i18n.t('user.NOT_FOUND'))

          const airport = airportMap.get(employee.airportId)?.dataValues
          if (!airport)
            throw new NotFoundException(this.i18n.t('airport.NOT_FOUND'))

          const employeesInAirportWithUser = employeesInAirport.map(emp => {
            const user = userMap.get(emp.userId)
            if (!user) {
              throw new NotFoundException(this.i18n.t('user.NOT_FOUND'))
            }

            return {
              ...emp.dataValues,
              ...user.dataValues,
            }
          })

          const p: EmployeeInput = {
            ...employee.dataValues,
            ...user.dataValues,
            airport: { airport, employees: employeesInAirportWithUser },
          }

          return p
        })
      },
    )
  }

  load (id: string): Promise<EmployeeInput> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<EmployeeInput[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(
      result => !(result instanceof Error),
    ) as EmployeeInput[]
  }
}
