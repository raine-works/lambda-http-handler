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
        context: Context, 
        callback: APIGatewayProxyCallback
    ) {
        global.stage = event.requestContext.stage
        this.event = event
        this.context = context
        this.callback = callback
    }
    
    // RESPONSE CONFIGS

    status(val: number) {
        this.response.statusCode = val
        return this
    }

    headers(val: any) {
        this.response.headers = val
        return this
    }

    body(val: string) {
        this.response.body = val
        return this
    }

    _404() {
        this.callback(null, {
            statusCode: 404, 
            body: 'The requested resource was not found...'
        })
    }

    _500(error: string) {
        this.callback(null, {
            statusCode: 500, 
            body: error
        })
    }

    send() {
        this.callback(null, this.response)
    }

    // HTTP METHODS

    method(method: string, path: string, callback: Function) {
        if (pathResolver(method, path, this.event)) {
            callback(this.event)
        } else {
            return this
        }
    }
}

interface Params {
    [key: string]: string
}
const pathResolver = (method: string, path: string, event: APIGatewayProxyEvent): boolean => {
    let params: Params = {}
    let pathValues = event.path.split('/').filter((e) => { return e !== '' })
    let paramKeys = path.split('/').filter((e) => { return e.includes(':') })
    let rootPath: string = `/${pathValues.splice(0, pathValues.length - paramKeys.length).join('/')}`
    for (let i = pathValues.length - paramKeys.length; i < pathValues.length; i++) {
        params[paramKeys[i]?.split(':')[1]] = pathValues[i]
    }
    let fullRootPath = paramKeys.length > 0 ? `${rootPath}/${paramKeys.join('/')}` : rootPath
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

export type { APIGatewayProxyCallback, APIGatewayProxyResult, APIGatewayProxyEvent, Context, APIGatewayProxyHandler }