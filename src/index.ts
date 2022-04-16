declare global {
	var stage: string
}
import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	APIGatewayProxyCallback,
	Context,
} from 'aws-lambda'

interface Event extends APIGatewayProxyEvent {
	[key: string]: any
}

interface Callback extends APIGatewayProxyCallback {}

interface NextFunction {
	(): this
}

export class HTTP {
	private _event: Event
	private _context: Context
	private _callback: Callback
	private _response: APIGatewayProxyResult = {
		statusCode: 200,
		headers: {},
		body: '',
	}
	next: Function
	constructor(
		event: Event,
		context: Context,
		callback: Callback,
		useProxy?: boolean
	) {
		global.stage = event.requestContext.stage
		this._event = event
		this._callback = callback
		this._context = context
		if (useProxy) {
			this._event.path = `/${event.pathParameters?.PROXY}` ?? ''
		}
		this.next = () => {
			return this
		}
	}

	// RESPONSE CONFIGS

	/**
	 * Set status code
	 * @param val {number}
	 */
	status(val: number) {
		this._response.statusCode = val
		return this
	}

	/**
	 * Set headers
	 * @param val {object}
	 */
	headers(val: any) {
		this._response.headers = val
		return this
	}

	/**
	 * Set body content
	 * @param val {string}
	 */
	body(val: any) {
		this._response.body = JSON.stringify(val)
		return this
	}

	/**
	 * Send quick 200 response
	 * @param val {string}
	 */
	_200(val: any) {
		this._callback(null, {
			statusCode: 200,
			body: JSON.stringify(val),
		})
	}

	/**
	 * Send quick 400 response
	 * @param error {string}
	 */
	_400(error: any) {
		this._callback(null, {
			statusCode: 400,
			body: JSON.stringify(error),
		})
	}

	/**
	 * Send quick 404 response
	 */
	_404() {
		this._callback(null, {
			statusCode: 404,
			body: 'The requested resource was not found...',
		})
	}

	/**
	 * Send quick 500 response
	 * @param error {string}
	 */
	_500(error: any) {
		this._callback(null, {
			statusCode: 500,
			body: JSON.stringify(error),
		})
	}

	/**
	 * Send response after after setting the status, headers, and body
	 */
	send() {
		this._callback(null, this._response)
	}

	// HTTP METHODS

	/**
	 * Define method and path
	 * @param method
	 * @param path
	 * @param callback
	 */
	method(method: string, path: string, ...args: any[]) {
		if (pathResolver(method, path, this._event)) {
			bodyParser(this._event)
			for (let i = 0; i < args.length; i++) {
				if (i < args.length - 1) {
					args[i](this, this._event, this.next)
				} else {
					args[i](this._event)
				}
			}
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
 */
const pathResolver = (method: string, path: string, event: Event): boolean => {
	let params: Params = {}
	let resourcePath = event.resource.split('/').filter((e) => {
		return e !== '' && !e.includes('*}') && !e.includes('+}')
	})
	let pathValues = event.path.split('/').filter((e) => {
		return e !== ''
	})
	for (let resourceLevel of resourcePath) {
		let index = pathValues.findIndex((e) => {
			return e === resourceLevel
		})
		pathValues.splice(index, 1)
	}
	let paramKeys = path.split('/').filter((e) => {
		return e.includes(':')
	})
	let rootPath: string = `/${pathValues
		.splice(0, pathValues.length - paramKeys.length)
		.join('/')}`
	for (
		let i = pathValues.length - paramKeys.length;
		i < pathValues.length;
		i++
	) {
		params[paramKeys[i]?.split(':')[1]] = pathValues[i]
	}
	let fullRootPath =
		paramKeys.length > 0
			? rootPath === '/'
				? `${rootPath}${paramKeys.join('/')}`
				: `${rootPath}/${paramKeys.join('/')}`
			: rootPath
	event.pathParameters = params
	if (method.toUpperCase() === event.httpMethod && path === fullRootPath) {
		return true
	} else {
		return false
	}
}

/**
 * Parse body content
 * @param event
 */
const bodyParser = (event: Event) => {
	event.body = event.body ? JSON.parse(event.body) : {}
	event.queryStringParameters = event.queryStringParameters
		? event.queryStringParameters
		: {}
}

export type { Callback, Event, Context, NextFunction }
