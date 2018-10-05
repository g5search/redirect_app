var forward = require('../app/lib/forward')

describe('Forwarding', () => {
	test('host is equal to root domain', () => {
		let www = forward.go('test.com', '/testSubDir')
		expect(www).toEqual({destination: 'http://www.test.com/testSubDir'})
	})
})
