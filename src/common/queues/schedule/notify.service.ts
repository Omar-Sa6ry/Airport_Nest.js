import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class ScheduleService {
  constructor (@InjectQueue('schedule') private readonly scheduleQueue: Queue) {}

  async sendNotify (leaveAt: Date, flightId: string) {
    await this.scheduleQueue.add('send-notification-before-flight', {
      leaveAt,
      flightId,
    })
    console.log(
      `Job added to queue to notify users for flight with id ${flightId}`,
    )
  }
}
