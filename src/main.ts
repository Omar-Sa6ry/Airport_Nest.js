import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import * as bodyParser from 'body-parser'
import { json } from 'express'
import { Sequelize } from 'sequelize-typescript'
import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { GeneralResponseInterceptor } from './common/interceptor/generalResponse.interceptor'
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common'

async function bootstrap () {
  try {
    const app = await NestFactory.create(AppModule)
    app.enableCors()
    app.useGlobalPipes(new ValidationPipe())
    app.useGlobalInterceptors(new GeneralResponseInterceptor())
    app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 1 }))
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    )

    // Stripe
    app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }))
    app.use(json())

    const sequelize = app.get(Sequelize)
    await sequelize.sync({ alter: true })

    await app.listen(process.env.PORT || 3000)
  } catch (error) {
    console.log(error)
    throw new BadRequestException(error)
  }
}

bootstrap()
