import { JsonWebToken } from './jsonwebtoken';


describe('domain/jsonwebtoken', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should be able to create a token', async () => {
    const token = await JsonWebToken.encode({ id: 1, name: 'John Doe' }, { key: 'secret' });

    expect(token.token).toBeDefined();
    expect(token.object).toBeDefined();
    expect(token.object.payload).toBeDefined();
    expect(token.object.payload.id).toBe(1);
    expect(token.object.payload.name).toBe('John Doe');
    expect(token.object.iss).toBeUndefined();
    expect(token.object.sub).toBeUndefined();
    expect(token.object.aud).toBeUndefined();
    expect(token.object.nbf).toBeUndefined();
  });

  test('should be able to create a token with options', async () => {
    const token = await JsonWebToken.encode({ id: 1, name: 'John Doe' }, { key: 'secret', aud: 'john_doe', sub: 'john_doe', iss: 'john_doe' });

    expect(token.token).toBeDefined();
    expect(token.object).toBeDefined();
    expect(token.object.payload).toBeDefined();
    expect(token.object.payload.id).toBe(1);
    expect(token.object.payload.name).toBe('John Doe');
    expect(token.object.sub).toBe('john_doe');
    expect(token.object.aud).toBe('john_doe');
    expect(token.object.nbf).toBeUndefined();
  });

  test('should be able to decode a token', async () => {
    const token = await JsonWebToken.encode({ id: 1, name: 'John Doe' }, { key: 'secret', __unsafe_NoDeriveKey: true });
    const decoded = await JsonWebToken.decode<Record<string, string | number>>(token.token, 'secret');

    if(decoded.isLeft()) return expect(decoded.isLeft()).toBeFalsy();

    expect(decoded.value).toBeInstanceOf(JsonWebToken);
    expect(decoded.value.payload).toBeDefined();
    expect(decoded.value.payload.id).toBe(1);
    expect(decoded.value.payload.name).toBe('John Doe');
    expect(decoded.value.iss).toBeUndefined();
    expect(decoded.value.sub).toBeUndefined();
    expect(decoded.value.aud).toBeUndefined();
    expect(decoded.value.nbf).toBeUndefined();
  });

  test('should be able to encode a token with key derivation', async () => {
    const token = await JsonWebToken.encode({
      id: 1,
      name: 'John Doe',
    }, {
      key: 'secret',
      salt: '4321f',
    });

    expect(token.token).toBeDefined();
    expect(token.object).toBeDefined();
    expect(token.object.payload).toBeDefined();
    expect(token.object.payload.id).toBe(1);
    expect(token.object.payload.name).toBe('John Doe');
    expect(token.object.iss).toBeUndefined();
    expect(token.object.sub).toBeUndefined();
    expect(token.object.aud).toBeUndefined();
    expect(token.object.nbf).toBeUndefined();

    const decodedWithoutSalt = await JsonWebToken.decode(token.token, 'secret');
    expect(decodedWithoutSalt.isLeft()).toBe(true);

    const decodedWithSalt = await JsonWebToken.decode(token.token, 'secret', '4321f');
    expect(decodedWithSalt.isLeft()).toBe(false);
  });
});