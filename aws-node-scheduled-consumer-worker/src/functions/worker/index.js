import BbPromise from 'bluebird'
import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk-core'

AWS.config.setPromisesDependency(BbPromise)

const sqs = AWSXRay.captureAWSClient(new AWS.SQS())

const QUEUE_URL = process.env.SQS_QUEUE_URL

const deleteMessage = async (receiptHandle) => {
  const params = {
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  }
  console.info('Invoking deleteMessage.', { params: JSON.stringify(params) })
  const data = await sqs.deleteMessage(params).promise()
  console.info('Invoked deleteMessage.', { data: JSON.stringify(data) })
  return data
}

const processMessage = async (message) => {
  console.info('Invoking processMessage.', { message: JSON.stringify(message) })
  console.log({ message: JSON.stringfy(message) })
  console.info('Invoked processMessage.')
}

export const handler = async (event, context ,callback) => {
  try {
    console.info('Invoking Worker.', { event: JSON.stringify(event) })
    const { ReceiptHandle, Body } = event
    const message = JSON.parse(Body)
    const processed = await processMessage(message)
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
