import { Controller, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { StripeService } from './stripe.service'

@Controller('stripe')
export class StripeController {
  constructor (private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleStripeWebhook (@Req() req: Request) {
    return this.stripeService.handleWebhook(req)
  }
}
