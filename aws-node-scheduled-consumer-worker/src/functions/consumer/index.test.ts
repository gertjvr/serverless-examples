import context from 'aws-lambda-mock-context'

import BbPromise from 'bluebird'
import { handler } from './index'

describe('consumer', () => {
  it.skip('execute', async () => {
    const event: any = {}
    await BbPromise.fromCallback(cb => handler(event, context(), cb))
  })
})
