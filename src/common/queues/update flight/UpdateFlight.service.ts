import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class UpdateFlightService {
  constructor (@InjectQueue('updateFlight') private flightUpdateQueue: Queue) {}

  async notifyTicketUsers (
    ticketIds: string[],
    updateFlightInput: string,
  ): Promise<boolean> {
    await this.flightUpdateQueue.add('send-flight-update', {
      ticketIds,
      updateFlightInput,
    })

    return true
  }
}
