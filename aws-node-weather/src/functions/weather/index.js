import fetch from 'node-fetch'
import { stringify } from 'querystring'

const createResponse = (body, statusCode, headers) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
    }
    return {
        statusCode: statusCode || 200,
        headers: { ...corsHeaders, ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    }
}

const createSuccessResponse = (body, headers) =>
    createResponse(body, 200, headers)

const createErrorResponse = (error, headers) => {
    console.error(`Error occurred: ${JSON.stringify(error)}`)
    return createResponse(error, 500, headers)
}

const getUrl = (url, params) => `${url}?${stringify(params)}`

const fetchGet = (url, params) => fetch(getUrl(url, params))

export const handler = (event, context, callback) => {
    console.info(`Invoking example handler. ${JSON.stringify(event)}`)
    const { pathParameters } = event
    const params = {
        q: pathParameters.city,
        appId: process.env.WEATHER_API_KEY,
    }

    fetchGet(process.env.WEATHER_API_URL, params)
        .then(response => response.json())
        .then(body => callback(null, createSuccessResponse(body)))
        .catch(error => callback(null, createErrorResponse(error)))

    console.info('Invoked example handler.')
}
