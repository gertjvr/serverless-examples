# Using Babel + Webpack for NodeJS on AWS Lambda

We have been using webpack + babel + eslint stack commonly for client side, why can't we do the same for our serverless api.

## The puzzle pieces

- [Serverless](https://serverless.com/)
- [Webpack](https://webpack.js.org/)
- [Babel](https://babeljs.io/)
- [ESLint](http://eslint.org/)

## How to put the puzzle pieces together.

### The folder structure

```
serverless-service
+-- src
|   +-- functions
|       +-- weather
|           +-- event.json
|           +-- index.js
+-- .babelrc
+-- .eslintrc.[yml|js]
+-- package.json
+-- serverless.yml
+-- webpackage.config.js
```

### serverless.yml
```yml
    service: example
    provider:
        name: aws
        runtime: nodejs4.3
        ...
    plugins:
        - serverless-webpack
        - serverless-offline
    package:
        individually: true
        exclude:
            - '**'
    functions:
        weather:
            handler: weather.handler
            environment:
                ...
            events:
                ...
            package:
                exclude:
                    - '!weather.js'
```

### weather.js
```javascript
import fetch from 'node-fetch'
import { stringify } from 'querystring'

export const handler = (event, context, callback) => {
    console.log(`Invoking example handler. ${JSON.stringify(event)}`)
    const { pathParameters } = event
    const params = { q: pathParameters.city }
    const qs = stringify(params)
    const url = `/api?${qs}`

    fetch(url)
        .then(response => response.json())
        .then(json => callback(null, json))
        .catch(err => callback(err))

    console.log('Invoked example handler.')
}
```

### Handy automation scripts
```json
    ...
    "scripts": {
        "test": "jest",
        "start": "sls offline --location .webpack",
        "lint": "eslint .",
        "sls": "sls",
        "build": "sls webpack",
        "package": "sls deploy --noDeploy",
        "deploy": "sls deploy -v"
    }
    ...
```

## Run example

### VSCode debugging

## TBA

### AWS Lambda current supports NodeJs language
| Version     | Status                         |
| ---         | ---                            |
| 0.10        | Deprecated (April 2017)        |
| 4.3.2       | Supported                      |
| 6.10.0 LTS  | Not supported _yet_            |

### Deprecated NodeJS 0.10
```javascript
var request = require('request')
var querystring = require('querystring')

var handler = function(event, context, callback) {
    var pathParameters = JSON.parse(event.pathParameters)
    var params = { q: pathParameters.city }
    var qs = querystring.stringify(params)

    request('/api?' + qs, function (error, response, body) {
        if (error) {
            callback(err)
        }

        callback(null, body)
    })
}

module.exports = handler
```


### Current NodeJS 4.3.2
#### Let see what supported http://node.green/
```javascript
const fetch = require('node-fetch')
const querystring = require('querystring')

const handler = (event, context, callback) => {
    const pathParameters = event.pathParameters
    const params = { q: pathParameters.city }
    const qs = querystring.stringify(params)

    fetch(`/api?${qs}`)
        .then(response => response.json())
        .then(body => callback(null, body))
        .catch(err => callback(err))
}

module.exports = handler
```

## Possible with babel
```javascript
import fetch from 'node-fetch'
import { stringify } from 'querystring'

export const handler = async (event, context, callback) => {
    const { pathParameters } = event
    const params = { q: pathParameters.city }
    const qs = stringify(params)

    try {
        const resposne = await fetch(`/api?${qs}`)
        callback(null, response.json())
    } catch(err) {
        callback(err)
    }
}
```

## .babelrc
```json
{
    "presets": [
        ["env", {
            "targets": {
                "node": 4.3
            }
        }]
    ],
    "plugins": [
        "transform-class-properties",
        "transform-object-rest-spread",
        "transform-runtime"
    ]
}
```

### What does ES2017 gives us extra.

#### spread _syntactic sugar for Object.assign but its so pretty_
```javascript
const point = { x: 1, y: 2, z: 3 }
const x = { ...point }
console.log(p) = { x: 1, y: 2, z: 3 }
```

#### rest operator
```javascript
const point = { x: 1, y: 2, z: 3 }
const { x, ...rest } = point

console.log(x) = 1
console.log(rest) = { y: 2, z: 3}
```
#### deconstruction
```javascript
const point = { x: 1, y: 2, z: 3 }
const { x, y, z } = point

console.log(x) = 1
console.log(y) = 2
console.log(z) = 3
```

#### async/await
```javascript
const callApi = () => fetch('https://github.com/')
    .then((response) => {
        return response.text()
    })

const callApi = async () {
    const resposne = await fetch('https://github.com/')
    return response.text()
}
```

## What has this solved for use.
- Major issue was dependency management.
- Tree shaking, removing unused code shirking lamba size.
- Indirect cost saving, _the large the function and its dependencies, to longer a cold start takes the more it will cost to invoke infrequent lambda functions_
