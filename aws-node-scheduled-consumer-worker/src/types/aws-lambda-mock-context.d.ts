import { Context } from 'aws-lambda'

declare module 'aws-lambda-mock-context' {
  export function context(options?: any): Context
}
