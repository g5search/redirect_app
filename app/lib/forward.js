module.exports = {
	go
}

function go(host, path) {
	// check root domain is the same as the host
	var [rootdomain] = host.match(/[^.]+(?:(?:[.](?:com|co|org|net|edu|gov)[.][^.]{2})|([.][^.]+))$/)
	// forward to the http://www. incase a site went live without an SSL attached
	if (rootdomain !== host)
		throw new Error('Redirects are not configured for this subdomain')

	return { destination: `http://www.${host}${path}` }
}