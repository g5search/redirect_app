var redirect = require('../../app/lib/redirect')
var multipleDesitnations = {
	name: 'forward.com',
	redirect_rules: [
		{
			request_matcher: '/test/sub/dir',
			redirect_url: 'https://www.test.com/stuff',
			wildcard: false
		},
		{
			request_matcher: '/test/sub/dir',
			redirect_url: 'http://www.test.com/stuff',
			wildcard: false
		}
	]
}
var secureDestination = {
	name: 'forward.com',
	redirect_rules: [
		{
			request_matcher: '/test/sub/dir',
			redirect_url: 'https://www.test.com/stuff',
			wildcard: false
		}
	]
}
var forward = {
	name: 'forward.com',
	redirect_rules: [
	]
}
test('redirects are longer than one', () => {
	let redirects = redirect.format(multipleDesitnations)
	expect(redirects).toEqual({ error: 'more than one redirect for this domain and path' })
})
test('No Redirects', () => {
	let redirects = redirect.format(forward)
	expect(redirects).toEqual({ error: 'There is no redirect for this domain' })
})
test('http to https', async () => {
	let redirects = await redirect.get('http://', 'nonsecure.com', '/secure')
	expect(redirects).toEqual({ destination: 'https://www.secure.com' })
})
test('http to http', async () => {
	let redirects = await redirect.get('http://', 'nonsecure.com', '/nonsecure')
	expect(redirects).toEqual({ destination: 'http://www.nonsecure.com' })
})
test('https to http', async () => {
	let redirects = await redirect.get('https://', 'secure.com', '/nonsecure')
	expect(redirects).toEqual({ destination: 'http://www.nonsecure.com' })
})
test('https to https', async () => {
	let redirects = await redirect.get('https://', 'secure.com', '/secure')
	expect(redirects).toEqual({ destination: 'https://www.secure.com' })
})
test('Wildcard', async () => {
	let redirects = await redirect.get('https://', 'wildcard.com', '/wildcard/test/subdir/test')
	expect(redirects).toEqual({ destination: 'https://www.wildcard.com/wildcard/subdir' })
})
test('forward', async () => {
	let redirects = await redirect.get('https://', 'forward.com', '/forward/test/subdir')
	expect(redirects).toEqual({ destination: 'http://www.forward.com/forward/test/subdir' })
})