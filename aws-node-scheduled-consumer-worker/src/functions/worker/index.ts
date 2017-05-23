import { Context, Callback } from 'aws-lambda'

import BbPromise from 'bluebird'
import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk-core'

AWS.config.setPromisesDependency(BbPromise)

const sqs: AWS.SQS = AWSXRay.captureAWSClient(new AWS.SQS())

const QUEUE_URL = process.env.SQS_QUEUE_URL

const deleteMessage = async (receiptHandle: string): Promise<any> => {
  const params: AWS.SQS.DeleteMessageRequest = {
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  }
  console.info('Invoking deleteMessage.', { params: JSON.stringify(params) })
  const data = await sqs.deleteMessage(params).promise()
  console.info('Invoked deleteMessage.', { data: JSON.stringify(data) })
  return data
}

const processMessage = async (message: string): Promise<boolean> => {
  try {
    console.info('Invoking processMessage.', { message })
    return true
  } finally {
    console.info('Invoked processMessage.')
  }
}

export const handler = async (event: AWS.SQS.Message, _context: Context, callback: Callback): Promise<void> => {
  try {
    console.info('Invoking Worker.', { event: JSON.stringify(event) })
    const { ReceiptHandle, Body: message } = event
    const processed: boolean = await processMessage(message)
    if (processed) {
      await deleteMessage(ReceiptHandle)
    }
    callback(null, 'DONE')
  } catch (err) {
    callback(err)
  } finally {
    console.info('Invoked Worker.')
  }
}

export default handler
