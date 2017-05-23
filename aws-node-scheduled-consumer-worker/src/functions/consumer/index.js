import BbPromise from 'bluebird'
import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk-core'

AWS.config.setPromisesDependency(BbPromise)

const sqs = AWSXRay.captureAWSClient(new AWS.SQS())
const lambda = AWSXRay.captureAWSClient(new AWS.Lambda())

const QUEUE_URL = process.env.SQS_QUEUE_URL
const WORKER_LAMBDA_FUNCTION_NAME = process.env.WORKER_LAMBDA_FUNCTION_NAME

const receiveMessages = async () => {
  const params = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
  }
  console.info('Invoking receiveMessages.', { params: JSON.stringify(params) })
  const data = await sqs.receiveMessage(params).promise()
  console.info('Invoked receiveMessages.', { data: JSON.stringify(data) })
  return data
}

const invokeWorkerLambda = async (task) => {
  const params = {
    FunctionName: WORKER_LAMBDA_FUNCTION_NAME,
    InvocationType: 'Event',
    Payload: JSON.stringify(task),
  }
  console.info('Invoking invokeWorkerLambda.', { params: JSON.stringify(params) })
  const data = await lambda.invoke(params).promise()
  console.info('Invoked invokeWorkerLambda.', { data: JSON.stringify(data) })
  return data
}

const handleSQSMessages = async (context, callback) => {
  console.info('Invoking handleSQSMessages.')
  const { Messages: messages } = await receiveMessages()
  if (messages && messages.length > 0) {
    console.info(`Invoking lambda workers[${messages.length}].`)
    const invocations = await BbPromise.map(messages, message => invokeWorkerLambda(message))
    if (context.getRemainingTimeInMillis() > 20000) {
      await handleSQSMessages(context, callback)
    }
    console.info(`Invoked lambda workers[${invocations.length}].`)
  }

  console.info('Invoked handleSQSMessages.')
}

export const handler = async (event, context, callback) => {
  try {
    console.info('Invoking Consumer.', { event: JSON.stringify(event) })
    await handleSQSMessages(context, callback)
    callback(null, 'DONE')
    console.info('Invoked Consumer.')
  } catch (err) {
    callback(err)
    console.error(`Invoked Consumer error: ${err.message}.`, err.stack)
  }
}

export default handler
