import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { User } from '../users/entities/user.entity'
import { AuthResponse } from './dtos/AuthRes.dto'
import { CreateUserDto } from './input/CreateUserData.dto'
import { LoginDto } from './dtos/Login.dto'
import { ResetPasswordDto } from './dtos/ResetPassword.dto'
import { ChangePasswordDto } from './dtos/ChangePassword.dto'
import { CreateImagDto } from '../../common/upload/dtos/createImage.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { CreatePassengerDto } from './input/CreatePassengerData.dto'
import { UserResponse } from '../users/dtos/UserResponse.dto'
import { Auth } from 'src/common/decerator/auth.decerator'

@Resolver(of => User)
export class AuthResolver {
  constructor (
    private readonly redisService: RedisService,
    private authService: AuthService,
  ) {}

  @Mutation(returns => AuthResponse)
  async register (
    @Args('fcmToken') fcmToken: string,
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('createPassengerDto') createPassengerDto: CreatePassengerDto,
    @Args('avatar', { nullable: true }) avatar?: CreateImagDto,
  ): Promise<AuthResponse> {
    return await this.authService.register(
      fcmToken,
      createUserDto,
      createPassengerDto,
      avatar,
    )
  }

  @Mutation(returns => AuthResponse)
  async login (
    @Args('fcmToken') fcmToken: string,
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const userCacheKey = `auth:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthResponse) {
      return { ...cachedUser }
    }

    return await this.authService.login(fcmToken, loginDto)
  }

  @Mutation(returns => AuthResponse)
  @Auth(Role.PILOT, Role.CREW, Role.ADMIN, Role.MANAGER)
  async forgotPassword (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<AuthResponse> {
    return await this.authService.forgotPassword(user.email)
  }

  @Mutation(returns => UserResponse)
  @Auth(Role.PILOT, Role.CREW, Role.ADMIN, Role.MANAGER)
  async resetPassword (
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<UserResponse> {
    return await this.authService.resetPassword(resetPasswordDto)
  }

  @Mutation(returns => UserResponse)
  @Auth(Role.PILOT, Role.CREW, Role.ADMIN, Role.MANAGER)
  async changePassword (
    @CurrentUser() user: CurrentUserDto,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponse> {
    return await this.authService.changePassword(user?.id, changePasswordDto)
  }

  @Mutation(returns => AuthResponse)
  async adminLogin (
    @Args('fcmToken') fcmToken: string,
    @Args('loginDto') loginDto: LoginDto,
    @Args('role') role: Role,
  ): Promise<AuthResponse> {
    const userCacheKey = `auth:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthResponse) {
      return { ...cachedUser }
    }

    return await this.authService.roleLogin(fcmToken, loginDto, role)
  }
}
