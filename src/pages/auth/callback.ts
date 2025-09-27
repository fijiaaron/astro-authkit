import type {APIRoute, AstroCookies, AstroCookieSetOptions} from 'astro'

import type {AuthenticateWithCodeOptions, AuthenticationResponse} from '@workos-inc/node'
import {WorkOS} from '@workos-inc/node'

import {sealData} from 'iron-session'

const WORKOS_API_KEY = import.meta.env.WORKOS_API_KEY
const WORKOS_CLIENT_ID = import.meta.env.WORKOS_CLIENT_ID
const WORKOS_COOKIE_PASSWORD = import.meta.env.WORKOS_COOKIE_PASSWORD

const workos = new WorkOS(WORKOS_API_KEY)
	
export const GET:APIRoute = async ({request, cookies, redirect}) => {
	const code = await getCodeFromRequestParams(request)
	const session = await authenticateWithCode(code)
	const encryptedSession = await encryptSession(session)
	await setWorkOSSessionCookie(cookies, encryptedSession)

	return new Response(`
		Authenticated with WorkOS.
		Got code: ${code}
		Got session: ${JSON.stringify(session)}
		Encrypted session: ${encryptedSession}
	`)
}

async function getCodeFromRequestParams(request:Request) {
	return String(new URL(request.url).searchParams.get('code'))
}

async function authenticateWithCode(code:string, clientId:string=WORKOS_CLIENT_ID) {
	const options:AuthenticateWithCodeOptions = {code, clientId}
	return await workos.userManagement.authenticateWithCode(options)
}

async function encryptSession(session:AuthenticationResponse, password:string=WORKOS_COOKIE_PASSWORD) {
	const encryptedSession = sealData(session, {password:password})
	return await encryptedSession
}

async function setWorkOSSessionCookie(cookies:AstroCookies, encryptedSession:string) {
	const cookieOptions:AstroCookieSetOptions = {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax'
	}

	cookies.set('wos-session', encryptedSession, cookieOptions)
}