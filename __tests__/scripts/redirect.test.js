const redirect = require('../../app/lib/redirect');

const multipleDesitnations = {
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
};

const secureDestination = {
  domain: 'forward.com',
  redirects: [{
    path: '/test/sub/dir',
    destination: 'www.test.com/stuff',
    wildcard: false
  }]
};

const forward = {
  domain: 'forward.com',
  redirects: []
};

test('redirects are longer than one', () => {
  const redirects = redirect.format(multipleDesitnations);
  expect(redirects).toEqual({ error: 'Multiple domains records have been found; How am I supposed to know which to use?' });
});

test('Secure and single desitnation', () => {
  secureDestination.redirects[0].secure_destination = true;
  const redirects = redirect.format(secureDestination);
  expect(redirects).toEqual({ destination: 'https://www.test.com/stuff' });
});

test('Non-Secure and single desitnation', () => {
  secureDestination.redirects[0].secure_destination = false;
  const redirects = redirect.format(secureDestination);
  expect(redirects).toEqual({ destination: 'http://www.test.com/stuff' });
});

test('No Redirects', () => {
  const redirects = redirect.format(forward);
  expect(redirects).toEqual({ error: 'There were no redirect destinations found for this domain.' });
});

test('http to https', async () => {
  const redirects = await redirect.get('http://', 'nonsecure.com', '/secure');
  expect(redirects).toEqual({ destination: 'https://www.secure.com' });
});

test('http to http', async () => {
  const redirects = await redirect.get('http://', 'nonsecure.com', '/nonsecure');
  expect(redirects).toEqual({ destination: 'http://www.nonsecure.com' });
});

test('https to http', async () => {
  const redirects = await redirect.get('https://', 'secure.com', '/nonsecure');
  expect(redirects).toEqual({ destination: 'http://www.nonsecure.com' });
});

test('https to https', async () => {
  const redirects = await redirect.get('https://', 'secure.com', '/secure');
  expect(redirects).toEqual({ destination: 'https://www.secure.com' });
});

test('Domain is in database more than once', async () => {
  const redirects = await redirect.get('https://', 'domain.com', '/secure');
  expect(redirects).toEqual({ error: 'More than one redirect was found for this domain/path.' });
});

test('Wildcard', async () => {
  const redirects = await redirect.get('https://', 'wildcard.com', '/wildcard/test/subdir');
  expect(redirects).toEqual({ destination: 'https://www.wildcard.com/wildcard/subdir' });
});

test('forward', async () => {
  const redirects = await redirect.get('https://', 'forward.com', '/forward/test/subdir');
  expect(redirects).toEqual({ destination: 'http://www.forward.com/forward/test/subdir' });
});
