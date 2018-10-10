const app = require('../../app/lib/index')
const request = require('supertest')

describe('GET wildcard.com', () => {
	test('host is equal to root domain', async () => {
		var response = await request(app)
			.get('/wildcard/test/subdir')
			.set('Host', 'wildcard.com')
		expect(response.statusCode).toBe(301)
	})
})

describe('GET wildcard.com', () => {
	test('no redirect configured', async () => {
		var response = await request(app)
			.get('/')
			.set('Host', 'www.wildcard.com')
		expect(response.text).toBe('Redirects are not configured for this subdomain')
	})
})

describe('GET loop.com', () => {
	test('Redirect Loop', async () => {
		var response = await request(app)
			.get('/')
			.set('Host', 'loop.com')
			.set('Protocol', 'http')
		expect(response.text).toBe('loop.com is incorrectly configured creating a redirect loop')
	})
})