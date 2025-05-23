import { User } from './entities/user.entity'
import { UpdateUserDto } from './dtos/UpdateUser.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { Passenger } from './entities/passenger.model'
import { Employee } from '../employee/entity/employee.model'
import { UserInput, UserInputResponse } from './input/User.input'
import { UploadService } from '../../common/upload/upload.service'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class UserService {
  constructor (
    private readonly i18n: I18nService,
    private uploadService: UploadService,
    private readonly redisService: RedisService,
    @InjectModel(User) private userRepo: typeof User,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
    @InjectModel(Passenger) private passengerRepo: typeof Passenger,
  ) {}

  async findById (id: string): Promise<UserInputResponse> {
    const user = await this.userRepo.findByPk(id)
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
    }

    const passenger = await this.passengerRepo.findOne({
      where: { userId: user.id },
    })
    if (!passenger)
      throw new BadRequestException(
        await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
      )

    const userWithPassenger: UserInput = {
      ...user.dataValues,
      passengerId: passenger.dataValues.id,
      ...passenger.dataValues,
    }
    const userCacheKey = `user:${user.id}`
    this.redisService.set(userCacheKey, userWithPassenger)

    return { data: userWithPassenger }
  }

  async findUserByEmployeeId (employeeId: string): Promise<User> {
    const employee = await this.employeeRepo.findByPk(employeeId)
    if (!employee) {
      throw new NotFoundException(await this.i18n.t('employee.NOT_FOUND'))
    }

    const user = await this.userRepo.findOne({
      where: { id: employee.userId },
    })
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.NOT_FOUND'))

    return user
  }

  async findByPhone (phone: string): Promise<UserInputResponse> {
    const user = await this.userRepo.findOne({ where: { phone } })
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
    }

    const passenger = await this.passengerRepo.findOne({
      where: { userId: user.id },
    })
    if (!passenger)
      throw new BadRequestException(
        await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
      )

    const userWithPassenger: UserInput = {
      ...user.dataValues,
      passengerId: passenger.dataValues.id,
      ...passenger.dataValues,
    }
    const userCacheKey = `user:${user.id}`
    this.redisService.set(userCacheKey, userWithPassenger)

    return { data: userWithPassenger }
  }

  async findByEmail (email: string): Promise<UserInputResponse> {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
    }

    const passenger = await this.passengerRepo.findOne({
      where: { userId: user.id },
    })
    if (!passenger)
      throw new BadRequestException(
        await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
      )

    const userWithPassenger: UserInput = {
      ...user.dataValues,
      passengerId: passenger.dataValues.id,
      ...passenger.dataValues,
    }
    const userCacheKey = `user:${user.id}`
    this.redisService.set(userCacheKey, userWithPassenger)

    return { data: userWithPassenger }
  }

  async update (
    updateUserDto: UpdateUserDto,
    id: string,
  ): Promise<UserInputResponse> {
    const transaction = await this.userRepo.sequelize.transaction()

    try {
      const user = await this.userRepo.findOne({ where: { id }, transaction })
      if (!user) {
        throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'))
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepo.findOne({
          where: { email: updateUserDto.email },
          transaction,
        })
        if (existingUser)
          throw new BadRequestException(await this.i18n.t('user.EMAIL_USED'))
      }

      Object.assign(user, updateUserDto)

      if (updateUserDto.avatar) {
        const oldPath = user.avatar
        const filename = await this.uploadService.uploadImage(
          updateUserDto.avatar,
        )
        if (typeof filename === 'string') {
          user.avatar = filename

          await this.uploadService.deleteImage(oldPath)
        }
      }

      await user.save({ transaction })

      const passenger = await this.passengerRepo.findOne({
        where: { userId: user.id },
      })
      if (!passenger)
        throw new BadRequestException(
          await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
        )

      const userWithPassenger: UserInput = {
        ...user.dataValues,
        passengerId: passenger.dataValues.id,
        ...passenger.dataValues,
      }
      const userCacheKey = `user:${user.id}`
      this.redisService.set(userCacheKey, userWithPassenger)

      await transaction.commit()
      return { data: userWithPassenger }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async deleteUser (id: string): Promise<UserInputResponse> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!(user instanceof User))
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'))

    const passenger = await this.passengerRepo.findOne({
      where: { userId: user.id },
    })
    if (!passenger)
      throw new BadRequestException(
        await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
      )

    this.uploadService.deleteImage(user.avatar)
    user.destroy()
    return { message: await this.i18n.t('user.DELETED'), data: null }
  }
}
