import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { User } from '../users/entities/user.entity'
import { AuthResponse } from './dtos/AuthRes.dto'
import { CreateUserDto } from './dtos/CreateUserData.dto'
import { LoginDto } from './dtos/Login.dto'
import { ResetPasswordDto } from './dtos/ResetPassword.dto'
import { ChangePasswordDto } from './dtos/ChangePassword.dto'
import { CreateImagDto } from '../../common/upload/dtos/createImage.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Permission, AllRoles } from 'src/common/constant/enum.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { CreatePassengerDto } from './dtos/CreatePassengerData.dto'
import { UserResponse } from '../users/dtos/UserResponse.dto'
import { Auth } from 'src/common/decerator/auth.decerator'
import { AdminAuthResponse } from './dtos/AdminAuthRes.dto'
import { CreateLocationInput } from '../location/inputs/CreateLocation.input'

@Resolver(() => User)
export class AuthResolver {
  constructor (
    private readonly redisService: RedisService,
    private authService: AuthService,
  ) {}

  @Mutation(() => AuthResponse)
  async register (
    @Args('fcmToken') fcmToken: string,
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('createPassengerDto') createPassengerDto: CreatePassengerDto,
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
    @Args('avatar', { nullable: true }) avatar?: CreateImagDto,
  ): Promise<AuthResponse> {
    return await this.authService.register(
      fcmToken,
      createUserDto,
      createPassengerDto,
      createLocationInput,
      avatar,
    )
  }

  @Mutation(() => AuthResponse)
  async login (
    @Args('fcmToken') fcmToken: string,
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const cachedUser = await this.redisService.get(`auth:${loginDto.email}`)

    if (cachedUser instanceof AuthResponse) {
      return { ...cachedUser }
    }

    return await this.authService.login(fcmToken, loginDto)
  }

  @Mutation(() => AuthResponse)
  @Auth(AllRoles, [Permission.ACCOUNT_RESET_PASSWORD])
  async forgotPassword (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<AuthResponse> {
    return await this.authService.forgotPassword(user.email)
  }

  @Mutation(() => UserResponse)
  @Auth(AllRoles, [Permission.ACCOUNT_RESET_PASSWORD])
  async resetPassword (
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<UserResponse> {
    return await this.authService.resetPassword(resetPasswordDto)
  }

  @Mutation(() => UserResponse)
  @Auth(AllRoles, [Permission.ACCOUNT_CHANGE_PASSWORD])
  async changePassword (
    @CurrentUser() user: CurrentUserDto,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponse> {
    return await this.authService.changePassword(user?.id, changePasswordDto)
  }

  @Mutation(() => AdminAuthResponse)
  async adminLogin (
    @Args('fcmToken') fcmToken: string,
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AdminAuthResponse> {
    return await this.authService.roleLogin(fcmToken, loginDto)
  }
}
