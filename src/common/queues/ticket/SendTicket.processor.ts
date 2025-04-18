import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import * as nodemailer from 'nodemailer'

@Processor('ticketQueue')
export class TicketQueueProcessor extends WorkerHost {
  private transporter

  constructor () {
    super()
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
  }

  async process (job: Job): Promise<void> {
    const { to, subject, text, attachment } = job.data

    try {
      const mailOptions: any = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
      }

      if (attachment) {
        mailOptions.attachments = [
          {
            filename: 'ticket.pdf',
            content: Buffer.from(attachment, 'base64'),
            encoding: 'base64',
          },
        ]
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent: %s', info.messageId)
    } catch (error) {
      console.error('Failed to send email:', error.message)
      throw error
    }
  }
}
