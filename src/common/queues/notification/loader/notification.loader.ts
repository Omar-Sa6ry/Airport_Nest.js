import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User } from 'src/modules/users/entities/user.entity'
import { NotificationService } from '../notification.service'

@Injectable()
export class NotificationLoader {
  constructor (
    @InjectModel(User) private userRepo: typeof User,
    private readonly notificationService: NotificationService,
  ) {}

  async sendNotifications (userIds: number[], title: string, body: string) {
    if (!userIds.length) return

    const users = await this.userRepo.findAll({
      where: { id: userIds },
      attributes: ['fcmToken'],
      raw: true,
    })

    const notifications = users.map(user => ({
      fcmToken: user.fcmToken,
      title,
      body,
    }))

    await this.notificationService.sendNotifications(notifications)
  }
}
