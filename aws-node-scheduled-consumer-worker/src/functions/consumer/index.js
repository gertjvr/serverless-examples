/* eslint-disable no-console */

import BbPromise from 'bluebird'
import AWS from 'aws-sdk'

const sqs = new AWS.SQS()
const lambda = new AWS.Lambda()

const QUEUE_URL = process.env.SQS_QUEUE_URL
const WORKER_LAMBDA_FUNCTION_NAME = process.env.WORKER_LAMBDA_FUNCTION_NAME

const receiveMessages = () => {
    console.info('Invoking receiveMessages')
    const params = {
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
    }
    return BbPromise.fromCallback(cb => sqs.receiveMessage(params, cb))
        .then((data) => {
            console.info('Invoked receiveMessages')
            return data.Messages
        })
}

const invokeWorkerLambda = (task) => {
    console.info(`Invoking invokeWorkerLambda: ${JSON.stringify(task)}`)
    const params = {
        FunctionName: WORKER_LAMBDA_FUNCTION_NAME,
        InvocationType: 'Event',
        Payload: JSON.stringify(task),
    }
    return BbPromise.fromCallback(cb => lambda.invoke(params, cb))
        .then((data) => {
            console.info('Invoked invokeWorkerLambda')
            return data
        })
}

const handleSQSMessages = (context, callback) => {
    console.info('Invoking handleSQSMessages')
    return receiveMessages()
        .then((messages) => {
            if (messages && messages.length > 0) {
                const invocations = messages.map(message =>
                    invokeWorkerLambda(message)
                        .then(() => {
                            if (context.getRemainingTimeInMillis() > 20000) {
                                handleSQSMessages(context, callback)
                            } else {
                                callback(null, 'PAUSE')
                            }
                        })
                )

                return BbPromise.all(invocations)
                    .then(() => callback(null, 'DONE'))
                    .then(() => console.log('Invoked handleSQSMessages'))
                    .catch(err => callback(err))
            }

            return BbPromise.resolve(() => callback(null, 'DONE'))
                .then(() => console.log('Invoked handleSQSMessages'))
        })
}

export const handler = (event, context, callback) => {
    console.log('Invoking Consumer')

    return handleSQSMessages(context, callback)
        .then(() => console.log('Invoked Consumer'))
}

export default handler
