import {
  /* SHORT ID */
  shortId,
  validateShortId,
  /* UUID */
  uuid,
  validateUuid,
  validateUuidWithDashes,
  validateUuidWithoutDashes,
} from './id';


describe('id.ts', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('shortId() should return a string', () => {
    expect(typeof shortId()).toBe('string');
  });

  test('uuid() should return a string', () => {
    expect(typeof uuid()).toBe('string');
  });

  test('validateShortId() should return true for a valid CID', () => {
    expect(validateShortId(shortId())).toBe(true);
  });

  test('validateCid() should return false for an invalid CID', () => {
    expect(validateShortId('')).toBe(false);
    expect(validateShortId('foo')).toBe(false);
    expect(validateShortId('bar')).toBe(false);
    expect(validateShortId('baz')).toBe(false);
    expect(validateShortId('qux')).toBe(false);
  });

  test('validateUuid() should return true for a valid UUID', () => {
    expect(validateUuid(uuid())).toBe(true);
  });

  test('validateUuid() should return false for an invalid UUID', () => {
    expect(validateUuid('')).toBe(false);
    expect(validateUuid('foo')).toBe(false);
    expect(validateUuid('bar')).toBe(false);
    expect(validateUuid('baz')).toBe(false);
    expect(validateUuid('qux')).toBe(false);
  });

  test('validateUuidWithDashes() should return true for a valid UUID with dashes', () => {
    expect(validateUuidWithDashes(uuid())).toBe(true);
  });

  test('validateUuidWithDashes() should return false for an invalid UUID with dashes', () => {
    expect(validateUuidWithDashes('')).toBe(false);
    expect(validateUuidWithDashes('foo')).toBe(false);
    expect(validateUuidWithDashes('bar')).toBe(false);
    expect(validateUuidWithDashes('baz')).toBe(false);
    expect(validateUuidWithDashes('qux')).toBe(false);
  });

  test('validateUuidWithoutDashes() should return true for a valid UUID without dashes', () => {
    expect(validateUuidWithoutDashes(uuid().replace(/-/g, ''))).toBe(true);
  });

  test('validateUuidWithoutDashes() should return false for an invalid UUID without dashes', () => {
    expect(validateUuidWithoutDashes('')).toBe(false);
    expect(validateUuidWithoutDashes('foo')).toBe(false);
    expect(validateUuidWithoutDashes('bar')).toBe(false);
    expect(validateUuidWithoutDashes('baz')).toBe(false);
    expect(validateUuidWithoutDashes('qux')).toBe(false);
  });

  test('shoud validate a external short ID', () => {
    const id = 'a3fc91a8be5fac24';
    expect(validateShortId(id)).toBe(true);
  });

  test('shoud validate a external UUID', () => {
    const id = 'f71e2627-467e-47ac-8421-ee0b20947c3e';
    expect(validateUuid(id)).toBe(true);
  });

  test('shoud validate a external UUID with dashes', () => {
    const id = 'fec2169b-6086-490d-a530-508ac3f25571';
    expect(validateUuidWithDashes(id)).toBe(true);
  });

  test('shoud validate a external UUID without dashes', () => {
    const id = '03bec190de6f46dbb611e080043bda99';
    expect(validateUuidWithoutDashes(id)).toBe(true);
  });
});