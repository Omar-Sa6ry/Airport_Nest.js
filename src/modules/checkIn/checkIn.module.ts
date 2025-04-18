import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { UserModule } from '../users/users.module'
import { CheckInResolver } from './checkIn.resolver'
import { SendTicketService } from 'src/common/queues/ticket/SendTicket.service'
import { CheckIn } from './entity/checkIn.entity'
import { GateModule } from '../gate/gate.module'
import { CheckInService } from './checkin.service'
import { SendTicketModule } from 'src/common/queues/ticket/SendTicket.module'

@Module({
  imports: [
    SequelizeModule.forFeature([CheckIn]),
    UserModule,
    GateModule,
    SendTicketModule,
    GateModule,
  ],
  providers: [CheckInResolver, CheckInService, SendTicketService],
})
export class CheckInModule {}
