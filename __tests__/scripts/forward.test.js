const forward = require('../../app/lib/forward');

describe('Forwarding', () => {
  test('host is equal to root domain', () => {
    const www = forward.go('test.com', '/testSubDir');
    expect(www).toEqual({ destination: 'http://www.test.com/testSubDir' });
  });
});

describe('subdomain', () => {
  test('the host is a subdomain', () => {
    const www = forward.go('www.test.com', '/testSubDir');
    expect(www).toEqual({ error: 'Redirects are not configured for this subdomain' });
  });
});
