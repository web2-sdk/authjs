import { Entity } from './Entity';

// eslint-disable-next-line @typescript-eslint/ban-types
class CustomEntity extends Entity<{}> {}

describe('Core::Domain::Entity', () => {
  it('should generate an ID if not provided', () => {
    const entity = new CustomEntity({});

    expect(entity.id).toBeTruthy();
  });

  it('should use the provided ID if provided', () => {
    const entity = new CustomEntity({}, 'custom-id');

    expect(entity.id).toEqual('custom-id');
  });

  it('should be able to check equality', () => {
    const entityOne = new CustomEntity({}, 'same-id');
    const entityTwo = new CustomEntity({}, 'same-id');

    class Another {}

    expect(entityOne.equals(null as unknown as any)).toBe(false);
    expect(entityOne.equals(new Another() as any)).toBe(false);

    expect(entityOne.equals(entityOne)).toBe(true);
    expect(entityOne.equals(entityTwo)).toBe(true);
  });
});