import { Context } from 'aws-lambda'
import BbPromise from 'bluebird'
import { handler } from './index'

describe('consumer', () => {
  it.skip('execute', async () => {
    const event: any = {}
    const context: Context = null
    await BbPromise.fromCallback(cb => handler(event, context, cb))
  })
})
