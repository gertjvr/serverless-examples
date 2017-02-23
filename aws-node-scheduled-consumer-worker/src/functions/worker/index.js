/* eslint-disable no-console */

import BbPromise from 'bluebird'
import AWS from 'aws-sdk'

import { updatePersonById } from 'infrastructure/elvanto'

const sqs = new AWS.SQS()

const QUEUE_URL = process.env.SQS_QUEUE_URL

export const handler = (event, context, callback) => {
    const { MessageId, ReceiptHandle, Body } = event
    console.info(`Invoking Worker ${MessageId}`)
    return BbPromise.bind(this)
        .then(() => JSON.parse(Body))
        .then(message => console.log({ message: JSON.stringfy(message) }))
        .then(() => deleteMessage(ReceiptHandle))
        .then(() => callback())
        .then((result) => {
            console.info('Invoked Worker')
            return result
        })
        .catch(err => callback(err))
}

export default handler
