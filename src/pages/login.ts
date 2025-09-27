import type {APIRoute} from 'astro'
import {WorkOS} from '@workos-inc/node'

const WORKOS_CLIENT_ID = import.meta.env.WORKOS_CLIENT_ID
const WORKOS_API_KEY = import.meta.env.WORKOS_API_KEY
const WORKOS_REDIRECT_URL = import.meta.env.WORKOS_REDIRECT_URL
const WORKOS_COOKIE_PASSWORD = import.meta.env.WORKOS_COOKIE_PASSWORD

const workos = new WorkOS(WORKOS_API_KEY)

export const GET:APIRoute = async ({redirect}) => {

	const authorizationUrl = await getAuthorizationUrl(workos)
	return redirect(authorizationUrl)
}

async function getAuthorizationUrl(workos:WorkOS) {
	const AuthkitConfig = {
		provider: 'authkit',
		redirectUri: WORKOS_REDIRECT_URL,
		clientId: WORKOS_CLIENT_ID
	}

	return workos.userManagement.getAuthorizationUrl(AuthkitConfig)
}