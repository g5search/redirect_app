const request = require('supertest');
const app = require('../../app/lib/index');

describe('GET wildcard.com', () => {
  test('host is equal to root domain', async () => {
    const response = await request(app)
      .get('/wildcard/test/subdir')
      .set('Host', 'wildcard.com');
    expect(response.statusCode).toBe(301);
  });
});

describe('GET wildcard.com', () => {
  test('no redirect configured', async () => {
    const response = await request(app)
      .get('/')
      .set('Host', 'www.wildcard.com');
    expect(response.text).toBe('No Redirect Destinations found for this requested domain.');
  });
});

describe('GET loop.com', () => {
  test('Redirect Loop', async () => {
    const response = await request(app)
      .get('/')
      .set('Host', 'loop.com')
      .set('Protocol', 'http');
    expect(response.text).toBe('loop.com is incorrectly configured creating a redirect loop.');
  });
});
