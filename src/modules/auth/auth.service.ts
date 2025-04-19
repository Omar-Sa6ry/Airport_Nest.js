import { Op } from 'sequelize'
import { GenerateToken } from './jwt/jwt.service'
import { User } from '../users/entities/user.entity'
import { HashPassword } from './utils/hashPassword'
import { randomBytes } from 'crypto'
import { ChangePasswordDto } from './dtos/ChangePassword.dto'
import { ResetPasswordDto } from './dtos/ResetPassword.dto'
import { LoginDto } from './dtos/Login.dto'
import { ComparePassword } from './utils/comparePassword'
import { SendEmailService } from 'src/common/queues/email/sendemail.service'
import { Passenger } from '../users/entities/passenger.model'
import { Employee } from '../employee/entity/employee.model'
import { CreatePassengerDto } from './dtos/CreatePassengerData.dto'
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { CreateUserDto } from './dtos/CreateUserData.dto'
import { EmployeeInput } from '../employee/input/Employee.input'
import { AuthEmployeeInputResponse } from './input/AuthEmployee'
import { AirportService } from '../airport/airport.service'
import { LocationService } from '../location/location.service'
import { Role } from 'src/common/constant/enum.constant'
import { UploadService } from '../../common/upload/upload.service'
import { AuthInputResponse } from './input/Auth.input'
import { InjectModel } from '@nestjs/sequelize'
import { I18nService } from 'nestjs-i18n'
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway'
import { UserInput, UserInputResponse } from '../users/input/User.input'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateLocationInput } from '../location/inputs/CreateLocation.input'

@Injectable()
export class AuthService {
  constructor (
    private readonly i18n: I18nService,
    private readonly generateToken: GenerateToken,
    private readonly locationService: LocationService,
    private readonly airportService: AirportService,
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
    private readonly sendEmailService: SendEmailService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectModel(User) private userRepo: typeof User,
    @InjectModel(Passenger) private passengerRepo: typeof Passenger,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
  ) {}

  async register (
    fcmToken: string,
    createUserDto: CreateUserDto,
    createPassengerDto: CreatePassengerDto,
    createLocationInput: CreateLocationInput,
    avatar?: CreateImagDto,
  ): Promise<AuthInputResponse> {
    const { email } = createUserDto
    if (!email.endsWith('@gmail.com'))
      throw new BadRequestException(await this.i18n.t('user.END_EMAIL'))
    const password = await HashPassword(createUserDto.password)

    const transaction = await this.userRepo.sequelize.transaction()
    try {
     console.log('ijigj')
 const user = await this.userRepo.create(
        {
          ...createUserDto,
          password,
        },
        { transaction },
      )
console.log('ijigj')

      if (avatar) {
        const filename = await this.uploadService.uploadImage(avatar)
        if (typeof filename === 'string') {
          user.avatar = filename
        }
      }

      user.fcmToken = fcmToken
      await user.save({ transaction })

      const token = await this.generateToken.jwt(user?.email, user?.id)
      const passenger = await this.passengerRepo.create(
        {
          ...createPassengerDto,
          userId: user?.id,
        },
        { transaction },
      )

      console.log('ijigj')
      this.locationService.create({
        ...createLocationInput,
        userId: user?.id,
      })
      console.log('ijigj')

      // first user is admin automatic
      const users = await this.userRepo.findAll({
        limit: 2,
      })
      if (users.length < 1) {
        user.role = Role.ADMIN
        await user.save({ transaction })
      }

      await transaction.commit()

      const userWithPassenger: UserInput = {
        ...user.dataValues,
        ...passenger.dataValues,
        passengerId: passenger.dataValues.id,
      }
      const result: AuthInputResponse = {
        data: { user: userWithPassenger, token },
        statusCode: 201,
        message: await this.i18n.t('user.CREATED'),
      }

      const relationCacheKey = `user:${user.id}`
      this.redisService.set(relationCacheKey, userWithPassenger)

      const relationCacheKey2 = `auth:${user.id}`
      this.redisService.set(relationCacheKey2, result)

      this.websocketGateway.broadcast('userCreated', {
        userId: user.id,
        user,
      })

      this.sendEmailService.sendEmail(
        email,
        'Register in App',
        `You registered successfully in the App`,
      )

      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async login (
    fcmToken: string,
    loginDto: LoginDto,
  ): Promise<AuthInputResponse> {
    const { email, password } = loginDto

    let user = await this.userRepo.findOne({ where: { email } })

    if (!user)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'))

    await ComparePassword(password, user?.password)
    const token = await this.generateToken.jwt(user?.email, user?.id)
    user.fcmToken = fcmToken
    await user.save()

    const passenger = await this.passengerRepo.findOne({
      where: { userId: user.id },
    })
    if (!passenger)
      throw new BadRequestException(
        await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
      )

    const userWithPassenger: UserInput = {
      ...user.dataValues,
      ...passenger.dataValues,
      passengerId: passenger.dataValues.id,
    }
    const result: AuthInputResponse = {
      data: { user: userWithPassenger, token },
      message: await this.i18n.t('user.LOGIN'),
    }

    const relationCacheKey = `user:${user.id}`
    this.redisService.set(relationCacheKey, userWithPassenger)

    const relationCacheKey2 = `auth:${user.id}`
    this.redisService.set(relationCacheKey2, result)

    return result
  }

  async forgotPassword (email: string): Promise<AuthInputResponse> {
    const lowerEmail = email.toLowerCase()
    const user = await await this.userRepo.findOne({
      where: { email: lowerEmail },
    })

    if (!(user instanceof User))
      throw new NotFoundException(await this.i18n.t('user.EMAIL_WRONG'))

    const token = randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiry = new Date(Date.now() + 900000) // 15 minutes
    const link = `http://localhost:3000/grapql/reset-password?token=${token}`
    await user.save()

    this.sendEmailService.sendEmail(
      lowerEmail,
      'Forgot Password',
      `click here to be able to change your password ${link}`,
    )

    return { message: await this.i18n.t('user.SEND_MSG'), data: null }
  }

  async resetPassword (
    resetPassword: ResetPasswordDto,
  ): Promise<UserInputResponse> {
    const { password, token } = resetPassword

    const transaction = await this.userRepo.sequelize.transaction()
    try {
      const user = await this.userRepo.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [Op.gt]: new Date() },
        },
        transaction,
      })

      if (!user)
        throw new BadRequestException(await this.i18n.t('user.NOT_FOUND'))

      user.password = await HashPassword(password)
      await user.save({ transaction })

      const relationCacheKey = `user:${user.id}`
      await this.redisService.set(relationCacheKey, user)

      await transaction.commit()

      const passenger = await this.passengerRepo.findOne({
        where: { userId: user.id },
      })
      if (!passenger)
        throw new BadRequestException(
          await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
        )

      const userWithPassenger: UserInput = {
        ...user.dataValues,
        ...passenger.dataValues,
        passengerId: passenger.dataValues.id,
      }

      return {
        message: await this.i18n.t('user.UPDATE_PASSWORD'),
        data: userWithPassenger,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async changePassword (
    id: string,
    changePassword: ChangePasswordDto,
  ): Promise<UserInputResponse> {
    const { password, newPassword } = changePassword
    if (password === newPassword)
      throw new BadRequestException(await this.i18n.t('user.LOGISANE_PASSWORD'))

    const transaction = await this.userRepo.sequelize.transaction()
    try {
      const user = await this.userRepo.findByPk(id)
      if (!user)
        throw new NotFoundException(await this.i18n.t('user.EMAIL_WRONG'))

      const isMatch = await ComparePassword(password, user.password)
      if (!isMatch)
        throw new BadRequestException(
          await this.i18n.t('user.OLD_IS_EQUAL_NEW'),
        )

      user.password = await HashPassword(newPassword)
      await user.save({ transaction })

      await transaction.commit()

      const passenger = await this.passengerRepo.findOne({
        where: { userId: user.id },
      })
      if (!passenger)
        throw new BadRequestException(
          await this.i18n.t('passenger.PASSENGER_NOT_FOUND'),
        )

      const userWithPassenger: UserInput = {
        ...user.dataValues,
        ...passenger.dataValues,
        passengerId: passenger.dataValues.id,
      }
      await transaction.commit()

      return {
        message: await this.i18n.t('user.UPDATE_PASSWORD'),
        data: userWithPassenger,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async roleLogin (
    fcmToken: string,
    loginDto: LoginDto,
  ): Promise<AuthEmployeeInputResponse> {
    const { email, password } = loginDto

    let user = await this.userRepo.findOne({ where: { email } })
    if (!(user instanceof User))
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'))

    const employee = await this.employeeRepo.findOne({
      where: { userId: user.id },
    })
    if (!employee)
      throw new BadRequestException(await this.i18n.t('employee.NOT_FOUND'))

    await ComparePassword(password, user?.password)
    const token = await this.generateToken.jwt(user?.email, user?.id)
    const userCacheKey = `user:${email}`
    await this.redisService.set(userCacheKey, { user, token })
    user.fcmToken = fcmToken
    await user.save()

    const airport = (await this.airportService.findById(employee.airportId))
      ?.data
    if (!airport)
      throw new NotFoundException(await this.i18n.t('airport.NOT_FOUND'))

    const userWithEmployee: EmployeeInput = {
      ...user.dataValues,
      ...employee.dataValues,
    }
    const result: AuthEmployeeInputResponse = {
      data: { user: userWithEmployee, token },
      statusCode: 201,
      message: await this.i18n.t('user.CREATED'),
    }

    const relationCacheKey = `user:${user.id}`
    this.redisService.set(relationCacheKey, userWithEmployee)

    const relationCacheKey2 = `auth:${user.id}`
    this.redisService.set(relationCacheKey2, result)

    return result
  }
}
