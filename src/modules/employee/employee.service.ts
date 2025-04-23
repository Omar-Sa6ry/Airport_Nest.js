import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { RedisService } from 'src/common/redis/redis.service'
import { User } from '../users/entities/user.entity'
import { Limit, Page } from 'src/common/constant/messages.constant'
import { Airport } from '../airport/entity/airport.model'
import { EmployeeLoader } from './loader/Employee.loader'
import { Employee } from './entity/employee.model'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import { EmployeeRole, Role } from 'src/common/constant/enum.constant'
import {
  EmployeeOutput,
  EmployeeResponse,
  EmployeesResponse,
} from './dto/Employee.response.dto'

@Injectable()
export class EmployeeService {
  constructor (
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketMessageGateway,
    private readonly employeeLoader: EmployeeLoader,
    @InjectModel(Airport) private airportRepo: typeof Airport,
    @InjectModel(User) private userRepo: typeof User,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
  ) {}

  async create (
    userId: string,
    airportId: string,
    role: Role,
    managerId: string,
  ): Promise<EmployeeResponse> {
    if (
      !Object.values(EmployeeRole).includes(role as unknown as EmployeeRole)
    ) {
      throw new BadRequestException(
        await this.i18n.t('employee.ROLE_NOT_FOUND'),
      )
    }

    // const manager = await this.employeeRepo.findOne({
    //   where: { userId: managerId },
    // })

    // if (manager.airportId !== airportId)
    //   throw new NotFoundException(
    //     await this.i18n.t('employee.NOT_MANAGER_IN_THIS_AIRPORT'),
    //   )

    const transaction = await this.employeeRepo.sequelize.transaction()
    try {
      const user = await this.userRepo.findByPk(userId)
      if (!user) {
        throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
      }

      const airport = await this.airportRepo.findByPk(airportId)
      if (!airport) {
        throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
      }

      const employee = await this.employeeRepo.create(
        { userId, airportId },
        { transaction },
      )

      user.role = role

      await user.save({ transaction })
      await transaction.commit()

      const result: EmployeeResponse = {
        data: {
          ...user.dataValues,
          ...employee.dataValues,
        },
      }

      const relationCacheKey = `user:${user.id}`
      this.redisService.set(relationCacheKey, result)

      this.websocketGateway.broadcast('employeeCreate', {
        userId: user.id,
        employeeId: employee.id,
      })

      return {
        data: result.data,
        message: await this.i18n.t('employee.CREATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findById (id: string): Promise<EmployeeResponse> {
    const user = await this.userRepo.findByPk(id)
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
    }

    const employee = await this.employeeRepo.findOne({
      where: { userId: user.id },
    })
    if (!employee)
      throw new BadRequestException(await this.i18n.t('employee.NOT_FOUND'))

    const airport = await this.airportRepo.findByPk(employee.airportId)
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const result: EmployeeResponse = {
      data: {
        ...user.dataValues,
        ...employee.dataValues,
      },
    }

    const userCacheKey = `user:${user.id}`
    this.redisService.set(userCacheKey, result)

    return result
  }

  async findByPhone (phone: string): Promise<EmployeeResponse> {
    const user = await this.userRepo.findOne({ where: { phone } })
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
    }

    const employee = await this.employeeRepo.findOne({
      where: { userId: user.id },
    })
    if (!employee)
      throw new BadRequestException(await this.i18n.t('employee.NOT_FOUND'))

    const result: EmployeeResponse = {
      data: {
        ...user.dataValues,
        ...employee.dataValues,
      },
    }

    const userCacheKey = `user:${user.id}`
    this.redisService.set(userCacheKey, result)

    return result
  }

  async findByEmail (email: string): Promise<EmployeeResponse> {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
    }

    const employee = await this.employeeRepo.findOne({
      where: { userId: user.id },
    })
    if (!employee)
      throw new BadRequestException(await this.i18n.t('employee.NOT_FOUND'))

    const airport = await this.airportRepo.findByPk(employee.airportId)
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const result: EmployeeResponse = {
      data: {
        ...user.dataValues,
        ...employee.dataValues,
      },
    }

    const userCacheKey = `user:${user.id}`
    this.redisService.set(userCacheKey, result)

    return result
  }

  async delete (id: string, managerId: string): Promise<EmployeeResponse> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!(user instanceof User))
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'))

    const employee = await this.employeeRepo.findOne({
      where: { userId: user.id },
    })
    if (!employee)
      throw new BadRequestException(await this.i18n.t('employee.NOT_FOUND'))

    const manager = await this.employeeRepo.findOne({
      where: { userId: managerId },
    })

    if (manager.airportId !== employee.airportId)
      throw new NotFoundException(
        await this.i18n.t('employee.NOT_MANAGER_IN_THIS_AIRPORT'),
      )

    await employee.destroy()
    return { message: await this.i18n.t('employee.DELETED'), data: null }
  }

  async editUserRoleInAirport (
    id: string,
    role: Role,
  ): Promise<EmployeeResponse> {
    const transaction = await this.employeeRepo.sequelize.transaction()

    try {
      const user = await this.userRepo.findByPk(id)
      if (!user) {
        throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
      }

      const employee = await this.employeeRepo.findOne({
        where: { userId: user?.id },
      })
      if (!(employee instanceof Employee))
        throw new BadRequestException(await this.i18n.t('employee.NOT_FOUND'))

      user.role = role
      await user.save({ transaction })

      await transaction.commit()

      const result: EmployeeResponse = {
        data: {
          ...user.dataValues,
          ...employee.dataValues,
        },
      }

      const relationCacheKey = `user:${user.id}`
      this.redisService.set(relationCacheKey, result)

      this.websocketGateway.broadcast('userUpdateRole', {
        userId: user.id,
        user,
      })

      return {
        data: result.data,
        message: await this.i18n.t('employee.UPDATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async editUserRoleToManager (id: string): Promise<EmployeeResponse> {
    const transaction = await this.employeeRepo.sequelize.transaction()

    try {
      const user = await this.userRepo.findByPk(id)
      if (!user) {
        throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
      }

      const employee = await this.employeeRepo.findOne({
        where: { userId: user?.id },
      })
      if (!(employee instanceof Employee))
        throw new BadRequestException(await this.i18n.t('employee.NOT_FOUND'))

      user.role = Role.MANAGER
      await user.save({ transaction })

      await transaction.commit()

      const result: EmployeeResponse = {
        data: {
          ...user.dataValues,
          ...employee.dataValues,
        },
      }

      const relationCacheKey = `user:${user.id}`
      this.redisService.set(relationCacheKey, result)

      this.websocketGateway.broadcast('userUpdateRole', {
        userId: user.id,
        user,
      })

      return {
        data: result.data,
        message: await this.i18n.t('employee.UPDATED'),
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async findEmployeeInAirport (
    airportId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<EmployeesResponse> {
    const airport = await this.airportRepo.findByPk(airportId)
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const { rows: data, count: total } =
      await this.employeeRepo.findAndCountAll({
        where: { airportId },
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
      })

    if (data.length !== 0) {
      const employees = await this.employeeLoader.loadMany(
        data.map(employee => employee.id),
      )

      const items: EmployeeOutput[] = data.map((m, index) => {
        const employee = employees[index]
        if (!employee)
          throw new NotFoundException(this.i18n.t('employee.NOT_FOUND'))

        return employee
      })

      const result: EmployeesResponse = {
        items,
        pagination: {
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      }

      return result
    }
  }

  async findAllEmployeeInAirport (airportId: string): Promise<EmployeeOutput[]> {
    const airport = await this.airportRepo.findByPk(airportId)
    if (!airport) {
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))
    }

    const data = await this.employeeRepo.findAll({
      where: { airportId },
      order: [['createdAt', 'DESC']],
    })

    if (data.length !== 0) {
      const employees = await this.employeeLoader.loadMany(
        data.map(employee => employee.id),
      )

      const items: EmployeeOutput[] = data.map((m, index) => {
        const employee = employees[index]
        if (!employee)
          throw new NotFoundException(this.i18n.t('employee.NOT_FOUND'))

        return employee
      })

      return items
    }
  }
}
