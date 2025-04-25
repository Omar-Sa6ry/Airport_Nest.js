import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({
        request: req,
        language: req.headers['accept-language'] || 'en',
      }),
      playground: true,
      uploads: true,
      debug: true,
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
          keepAlive: 10000,
        },
        'graphql-ws': true,
      },
      formatError: error => {
        const originalError = error.extensions || {}
        return {
          ...originalError,
          message: error.message || originalError.message || 'Unknown error',
          success: false,
          statusCode: originalError.statusCode || 500,
          timeStamp: new Date().toISOString().split('T')[0],
          stacktrace: undefined,
          code: undefined,
        }
      },
    }),
  ],
})
export class GraphqlModule {}
