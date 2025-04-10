import { UserService } from 'src/modules/users/users.service'
import { User } from 'src/modules/users/entities/user.entity'
import { GqlExecutionContext } from '@nestjs/graphql'
import { I18nService } from 'nestjs-i18n'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { Role } from '../constant/enum.constant'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Passenger } from 'src/modules/users/entities/passenger.model'
import { Employee } from 'src/modules/users/entities/employee.model'
@Injectable()
export class RoleGuard implements CanActivate {
  constructor (
    private readonly i18n: I18nService,
    private jwtService: JwtService,
    private reflector: Reflector,
    @InjectModel(User) private userRepo: typeof User,
    @InjectModel(Passenger) private passengerRepo: typeof Passenger,
    @InjectModel(Employee) private employeeRepo: typeof Employee,
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext()
    const request = ctx.req

    const token = await this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException(await this.i18n.t('user.NO_TOKEN'))
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })

      if (payload.id && payload.email) {
        const user = await (
          await this.userRepo.findByPk(payload.id)
        )?.dataValues
        if (!user) {
          throw new NotFoundException(
            'User with id ' + payload.id + ' not found',
          )
        }

        const passenger = await this.passengerRepo.findOne({
          where: { userId: user.id },
        })
        if (!passenger) {
          const employee = await this.employeeRepo.findOne({
            where: { userId: user.id },
          })

          const requiredRoles = await this.reflector.get<Role[]>(
            'roles',
            context.getHandler(),
          )

          if (requiredRoles && requiredRoles.includes(employee.role)) {
            request['user'] = {
              id: payload.id,
              email: payload.email,
            }
          } else {
            throw new UnauthorizedException(
              await this.i18n.t('user.INVALID_TOKEN_PAYLOAD'),
            )
          }
        }

        request['user'] = {
          id: payload.id,
          email: payload.email,
        }
      } else {
        throw new UnauthorizedException(
          await this.i18n.t('user.INVALID_TOKEN_PAYLOAD'),
        )
      }
    } catch {
      throw new UnauthorizedException(await this.i18n.t('user.INVALID_TOKEN'))
    }

    return true
  }

  extractTokenFromHeader (request: Request): string | null {
    const [type, token] = request.headers['authorization']?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
