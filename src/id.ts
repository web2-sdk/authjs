
/**
 * A regex pattern for validating UUIDs with dashes
 */
export const uuidWithDashesPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * A regex pattern for validating UUIDs without dashes
 */
export const uuidWithoutDashesPattern = /^[0-9a-f]{32}$/i;

/**
 * A regex pattern for validating a short ID
 */
export const shortIdPattern = /^[0-9a-f]{16}$/i;


/**
 * Generate a random short ID
 * 
 * @length 16
 * @returns {string} A short ID string 
 */
export function shortId(): string {
  const bytes = new Uint8Array(8);
  const arr = crypto.getRandomValues(bytes);

  return Array.prototype.map.call(arr, function(byte) {
    return ('0' + byte.toString(16)).slice(-2);
  }).join('');
}


/**
 * Generate a random UUID
 * 
 * @returns {string} A UUID string 
 */
export function uuid(): string {
  let d = new Date().getTime();

  if(typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
      
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}


/**
 * Validates a short ID string
 * 
 * @param {string} id The short ID to validate 
 * @returns {boolean} True if the short ID is valid, false otherwise
 */
export const validateShortId = (id: string): boolean => (
  typeof id === 'string' &&
  shortIdPattern.test(id)
);


/**
 * Validates a UUID string with or without dashes
 * 
 * @param {string} id The UUID to validate 
 * @returns {boolean} True if the UUID is valid, false otherwise
 */
export const validateUuid = (id: string) => (
  typeof id === 'string' &&
  (uuidWithDashesPattern.test(id) || uuidWithoutDashesPattern.test(id))
);


/**
 * Validates a UUID string with dashes
 * 
 * @param {string} id The UUID to validate 
 * @returns {boolean} True if the UUID is valid, false otherwise
 */
export const validateUuidWithDashes = (id: string) => (
  typeof id === 'string' &&
  uuidWithDashesPattern.test(id)
);


/**
 * Validates a UUID string without dashes
 * 
 * @param {string} id The UUID to validate 
 * @returns {boolean} True if the UUID is valid, false otherwise
 */
export const validateUuidWithoutDashes = (id: string) => (
  typeof id === 'string' &&
  uuidWithoutDashesPattern.test(id)
);