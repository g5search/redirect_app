var redirect = require('../../app/lib/redirect')
var multipleDesitnations = {
	domain: 'forward.com', 
	redirects: [
		{
			path: '/test/sub/dir', 
			destination: 'www.test.com/stuff',
			secure_destination: true, 
			wildcard: false
		},
		{
			path: '/test/sub/dir', 
			destination: 'www.test.com/stuff',
			secure_destination: false, 
			wildcard: false
		}
	]
}
var secureDestination = {
	domain: 'forward.com', 
	redirects: [
		{
			path: '/test/sub/dir', 
			destination: 'www.test.com/stuff',
			wildcard: false
		}
	]
}
var forward = {
	domain: 'forward.com', 
	redirects: [
	]
}
test('redirects are longer than one', () => {
	let redirects = redirect.format(multipleDesitnations)
	expect(redirects).toEqual({ error: 'more than one redirect for this domain and path' })
})
test('Secure and single desitnation', () => {
	secureDestination.redirects[0].secure_destination = true
	let redirects = redirect.format(secureDestination)
	expect(redirects).toEqual({ destination: 'https://www.test.com/stuff' })
})
test('Non-Secure and single desitnation', () => {
	secureDestination.redirects[0].secure_destination = false
	let redirects = redirect.format(secureDestination)
	expect(redirects).toEqual({ destination: 'http://www.test.com/stuff' })
})
test('No Redirects', () => {
	let redirects = redirect.format(forward)
	expect(redirects).toEqual({ error: 'There is no redirect for this domain' })
})
test('http to https', async () => {
	let redirects = await redirect.get('http://', 'nonsecure.com', '/secure')
	expect(redirects).toEqual({destination: 'https://www.secure.com'})
})
test('http to http', async () => {
	let redirects = await redirect.get('http://', 'nonsecure.com', '/nonsecure')
	expect(redirects).toEqual({destination: 'http://www.nonsecure.com'})
})
test('https to http', async () => {
	let redirects = await redirect.get('https://', 'secure.com', '/nonsecure')
	expect(redirects).toEqual({destination: 'http://www.nonsecure.com'})
})
test('https to https', async () => {
	let redirects = await redirect.get('https://', 'secure.com', '/secure')
	expect(redirects).toEqual({destination: 'https://www.secure.com'})
})
test('Wildcard', async () => {
	debugger
	let redirects = await redirect.get('https://', 'wildcard.com', '/wildcard/test/subdir')
	expect(redirects).toEqual({ destination: 'https://www.wildcard.com/wildcard/subdir' })
})
test('forward', async () => {
	let redirects = await redirect.get('https://', 'forward.com', '/forward/test/subdir')
	expect(redirects).toEqual({ destination: 'http://www.forward.com/forward/test/subdir' })
})