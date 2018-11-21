var forward = require('../../app/lib/forward')

describe('Forwarding', () => {
	test('host is equal to root domain', () => {
		let www = forward.go('test.com', '/testSubDir')
		expect(www).toEqual({ destination: 'http://www.test.com/testSubDir' })
	})
})
describe('subdomain', () => {
	test('the host is a subdomain', () => {
		let www = forward.go('www.test.com', '/testSubDir')
		expect(www).toEqual(new Error('Redirects are not configured for this subdomain'))
	})
})
