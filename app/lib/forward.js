module.exports = {
    go
}

function go(host, path) {
    // check root domain is the same as the host
    var rootdomain = host.match(/[^.]+(?:(?:[.](?:com|co|org|net|edu|gov)[.][^.]{2})|([.][^.]+))$/)
    // forward to the http://www. incase a site went live without an SSL attached
    newURL = 'http://www.' + host + path
    if (rootdomain[0] === host) {
        // add WWW and forward
        return { destination: newURL }
    } else {
        // return error because this is a subdomain and we will not handle forwarding for it
        return { error: 'Redirects are not configured for this subdomain' }
    }
}