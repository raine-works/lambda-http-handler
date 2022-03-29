# Lambda Proxy HTTP Handler

This library for handling http requests within the context of a lambda handler function. If you're familiar with express.js you will feel right at home working with this library.

## Getting started

    npm install @raine-works/lambda-http-handler 
    
    const { HTTP } = require('@raine-works/lambda-http-handler')
    
    export const handler = async (event, context, callback) => {
        const http = HTTP(event, callback, context)
        
        http.method('GET', '/route/:id', (event) => {
            http.status(200).headers({ content-type: 'application/json' }).body('Hi mom!').send()    
        }
        
        http._404()
    }
