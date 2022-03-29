# Lambda Proxy HTTP Handler

This library is for handling http requests within the context of a lambda function handler method. If you're familiar with express.js you will feel right at home working with lambda-http-handler.

## Getting started

`INSTALL`

    npm install @raine-works/lambda-http-handler

`SERVERLESS.YML`

I'm using serverless as an example but this can be setup by configuring your OpenAPI config. The path and method should be set to ANY.

    functions:
        function-name:
            handler: index.handler
            events:
                - http:
                    path: /{ANY+}
                    method: ANY

`EXAMPLE`

    const { HTTP } = require('@raine-works/lambda-http-handler')

    export const handler = async (event, context, callback) => {
        try {
            const http = new HTTP(event, callback, context)

            http.method('GET', '/route/:id', (event) => {
                http.status(200).headers({ content-type: 'application/json' }).body('Hi mom!').send()
            }

            http._404()
        } catch (error) {
            http._500(error.message)
        }
    }

## API reference

`Create a new HTTP instance`

The HTTP class requires a lambda event and callback; the context object is optional.

    const http = new HTTP(event, callback, context)

`method`

The method function captures the http method and path and then passes the event object to a callback function if they match the event.

    http.method('POST', '/create-user', (event) => {
        // Your code here
    })

The method function also parses the event body and captures path parameters. To use custom parameters you can use the following syntax.

    http.method('GET', '/user/:id', (event) => {
        // Your code here
    })

`status`

The status function sets the status code on the lambda response object.

    http.status(418)

`headers`

The headers function sets the headers on the lambda response object.

    http.headers({ 'content-type': 'application/json' })

`body`

The body function sets the body content on the lambda response object.

    http.body('Hello World!')

`send`

The send function executes the lambda callback method and passed the lambda response object. This should be used after setting at least the status and body.

    http.status(200).body('Hi Mom!').send()

`_200`

The \_200 function is a quick way to send a string back to the client with a 200 status code.

    http._200('It worked...')

`_400`

The \_400 function is a quick way to send an error message back to the client with a 400 status code.

    http._400('Bad request...')

`_404`

The \_404 function is quick way to send a 404 status code back to the client. This method automatically sets the body content to "The requested resource was not found..."

    http._404()

`_500`

The \_500 function is a quick way to send an error message back to the client with a 500 status code.

    http._500('Internal server error...')
