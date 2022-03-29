declare global { var stage: string }
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyCallback, Context, APIGatewayProxyHandler } from 'aws-lambda'

export class HTTP {
    
    private event: APIGatewayProxyEvent
    private context: Context
    private callback: APIGatewayProxyCallback
    private response: APIGatewayProxyResult = {
        statusCode: 200, 
        headers: {}, 
        body: ''
    }
    constructor(
        event: APIGatewayProxyEvent,
        callback: APIGatewayProxyCallback,
        context: Context
    ) {
        global.stage = event.requestContext.stage
        this.event = event
        this.callback = callback
        this.context = context
    }
    
    // RESPONSE CONFIGS

    /**
     * Set status code
     * @param val {number}
     * @returns 
     */
    status(val: number) {
        this.response.statusCode = val
        return this
    }

    /**
     * Set headers
     * @param val {object}
     * @returns 
     */
    headers(val: any) {
        this.response.headers = val
        return this
    }

    /**
     * Set body content
     * @param val {string}
     * @returns 
     */
    body(val: string) {
        this.response.body = val
        return this
    }

    /**
     * Send quick 200 response
     * @param val {string}
     */
    _200(val: string) {
        this.callback(null, {
            statusCode: 200, 
            body: val
        })
    }

    /**
     * Send quick 400 response
     * @param error {string}
     */
    _400(error: string) {
        this.callback(null, {
            statusCode: 400, 
            body: error
        })
    }

    /**
     * Send quick 404 response
     */
    _404() {
        this.callback(null, {
            statusCode: 404, 
            body: 'The requested resource was not found...'
        })
    }

    /**
     * Send quick 500 response
     * @param error {string}
     */
    _500(error: string) {
        this.callback(null, {
            statusCode: 500, 
            body: error
        })
    }

    /**
     * Send response after after setting the status, headers, and body
     */
    send() {
        this.callback(null, this.response)
    }

    // HTTP METHODS

    /**
     * Define method and path
     * @param method 
     * @param path 
     * @param callback 
     * @returns 
     */
    method(method: string, path: string, callback: Function) {
        if (pathResolver(method, path, this.event)) {
            bodyParser(this.event)
            callback(this.event)
        } else {
            return this
        }
    }
}

interface Params {
    [key: string]: string
}

/**
 * Resolve path and params
 * @param method 
 * @param path 
 * @param event 
 * @returns 
 */
const pathResolver = (method: string, path: string, event: APIGatewayProxyEvent): boolean => {
    let params: Params = {}
    let pathValues = event.path.split('/').filter((e) => { return e !== '' })
    let paramKeys = path.split('/').filter((e) => { return e.includes(':') })
    let rootPath: string = `/${pathValues.splice(0, pathValues.length - paramKeys.length).join('/')}`
    for (let i = pathValues.length - paramKeys.length; i < pathValues.length; i++) {
        params[paramKeys[i]?.split(':')[1]] = pathValues[i]
    }
    let fullRootPath = paramKeys.length > 0 ? rootPath === '/' ? `${rootPath}${paramKeys.join('/')}` : `${rootPath}/${paramKeys.join('/')}` : rootPath
    event.pathParameters = params
    if (
        method.toUpperCase() === event.httpMethod 
        && path === fullRootPath
    ) {
        return true
    } else {
        return false
    }
}

/**
 * Parse body content
 * @param event 
 */
const bodyParser = (event: APIGatewayProxyEvent) => {
    event.body = event.body ? JSON.parse(event.body) : {}
}

export type { APIGatewayProxyCallback, APIGatewayProxyResult, APIGatewayProxyEvent, Context, APIGatewayProxyHandler }