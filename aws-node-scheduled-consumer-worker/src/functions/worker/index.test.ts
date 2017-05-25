import context from 'aws-lambda-mock-context'

import BbPromise from 'bluebird'
import AWSXRay from 'aws-xray-sdk-core'
import { handler } from './index'

describe('worker', () => {
  it.skip('execute', () => {
    const event: AWS.SQS.Message = {
      'MessageId': '79b98815-3e55-4fdb-bda0-8d4b9c764bda',
      'ReceiptHandle': 'AQEBEmJrGlpj1tvM0mkaGt+D6vmGgnw/I4gnrfPQjR5RWFEkkgCvMJIvJiDshWn6uvnv9xHAKm5XAjeWKYh5d/cLL9ih0U/fkU5CtySF7nT8U/Wx2kvY1vUpFru4CMuE+5ZnE2J1PVVb0BKiu5wo7Lse7V8mr7Vg8/TbBN1V4TCiIhKjufoa1H3HSz5BTEVFgg8ekbYPzZXtbrmAY8d7ZyKE1QPixmEKxR31/MyOdMdKbqyNGcir30ElhcnH7FHmMIE/yeAyFXDjsYwmI09Ob2ROWfN608eK8F+vg4m+qeN5ZTp+vSyK5ViGQqmEDlgVmwBQ7kE2iEaorifZOhwSnhACBKU3xJU+g5fRPQ4K+1VDGeQHVBmMvd/LWOQP7CuLbHdfT75LLy8Mn/E7pYyCUo0JMWCcN+Q7/zNWtMhJmHfC68s=',
      'MD5OfBody': 'fbc24bcc7a1794758fc1327fcfebdaf6',
      'Body': '{"hello":"world"}'
    }

    const segment = new AWSXRay.Segment('invoke')
    AWSXRay.setSegment(segment)

    BbPromise.fromCallback(cb => handler(event, context(), cb))

  })
})
