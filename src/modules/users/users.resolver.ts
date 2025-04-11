import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { User } from './entities/user.entity'
import { UserService } from './users.service'
import { UpdateUserDto } from './dtos/UpdateUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { RedisService } from 'src/common/redis/redis.service'
import { Auth } from 'src/common/decerator/auth.decerator'
import { UserResponse } from './dtos/UserResponse.dto'
import { EmployeeResponse } from '../employee/dto/Employee.response.dto'

@Resolver(() => User)
export class UserResolver {
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
  ) {}

  @Query(returns => UserResponse)
  async getUserById (@Args('id') id: string): Promise<UserResponse> {
    const userCacheKey = `user:${id}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser instanceof UserResponse) {
      return { ...cachedUser }
    }

    return await this.usersService.findById(id)
  }

  @Query(returns => UserResponse)
  async getUserByEmail (@Args('email') email: string): Promise<UserResponse> {
    const userCacheKey = `user:${email}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser instanceof UserResponse) {
      return { ...cachedUser }
    }

    return await this.usersService.findByEmail(email)
  }

  @Query(returns => UserResponse)
  async getUserByphone (@Args('phone') phone: string): Promise<UserResponse> {
    const userCacheKey = `user:${phone}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser instanceof UserResponse) {
      return { ...cachedUser }
    }

    return await this.usersService.findByPhone(phone)
  }

  @Mutation(returns => UserResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async updateUser (
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<UserResponse> {
    return await this.usersService.update(updateUserDto, user?.id)
  }

  @Query(returns => UserResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async deleteUser (@CurrentUser() user: CurrentUserDto): Promise<UserResponse> {
    return await this.usersService.deleteUser(user.id)
  }
}
