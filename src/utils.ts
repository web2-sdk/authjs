import type { DataType } from './types';


export const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_NODE_ENV === 'production';

const kindOf = (cache => (thing: any) => {
  const str = Object.prototype.toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));


export const kindOfTest = (type: string) => {
  type = type.toLowerCase();
  return (thing: any) => kindOf(thing) === type;
};


/**
 * Test if a value is of a certain type
 * @param type The type to test against
 * @returns {boolean} True if the value is of the specified type, otherwise false
 */
export const typeofTest = (type: DataType): ((thing: any) => boolean) => (thing: any) => typeof thing === type;


/**
 * Determine if a value is undefined
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if the value is undefined, otherwise false
 */
export const isUndefined = typeofTest('undefined');

/**
 * Determine if a value is a Buffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
export function isBuffer(val: any): boolean {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
const isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
export function isArrayBufferView(val: any): boolean {
  let result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}


/**
 * Checks if the value is a string.
 * 
 * @param {*} value The value to be checked
 * @returns {boolean} True if the value is a string, false otherwise
 */
export function isString(value: unknown): value is string {
  return (
    typeofTest('string')(value) ||
    (value instanceof String)
  );
}



/**
 * Determine if a value is a Function
 *
 * @param {*} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
export const isFunction = typeofTest('function');


/**
 * Determine if a value is an Object
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an Object, otherwise false
 */
export const isObject = (thing: any): boolean => thing !== null && typeof thing === 'object';


/**
 * Determine if a value is a Boolean
 *
 * @param {*} thing The value to test
 * @returns {boolean} True if value is a Boolean, otherwise false
 */
export const isBoolean = (thing: any): boolean => thing === true || thing === false;


/**
 * Determine if a value is a Date
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Date, otherwise false
 */
export const isDate = kindOfTest('Date');


/**
 * Determine if a value is a File
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
export const isFile = kindOfTest('File');


/**
 * Determine if a value is a Blob
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Blob, otherwise false
 */
export const isBlob = kindOfTest('Blob');


/**
 * Determine if a value is a FileList
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
export const isFileList = kindOfTest('FileList');


/**
 * Determine if a value is a Stream
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Stream, otherwise false
 */
export const isStream = (val: any) => isObject(val) && isFunction(val.pipe);


/**
 * Determine if a value is a FormData
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an FormData, otherwise false
 */
export function isFormData(thing: any) {
  let kind;

  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) || (
      isFunction(thing.append) && (
        (kind = kindOf(thing)) === 'formdata' ||
        // detect form-data instance
        (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
      )
    )
  );
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
export const isURLSearchParams = kindOfTest('URLSearchParams');


/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 *
 * @returns {boolean} True if value is an Array, otherwise false
 */
export const isArray = Array.isArray;


/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */
export function isPlainObject(val: any): boolean {
  if(isArray(val)) return false;
  if (kindOf(val) !== 'object' || typeof val !== 'object') return false;
  const prototype = Object.getPrototypeOf(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
}


/**
 * Checks if the value is a number.
 * 
 * @param {*} value The value to be checked 
 * @returns {boolean} True if the value is a number, false otherwise
 */
export function isDigit(value: unknown): value is number {
  return (
    typeofTest('number')(value) ||
    (value instanceof Number)
  ) && !Number.isNaN(value);
} 


/**
 * Checks if the provided value is a number represented as one of teh following:
 * - A number
 * - A string containing a number (e.g. `'123'`)
 * - A string containing a number with a leading `+` or `-` sign (e.g. `'+123'`, `'-123'`)
 * - A hexadecimal number (e.g. `0x123`)
 * - A binary number (e.g. `0b101`)
 * - An octal number (e.g. `0o123`)
 * 
 * @param {*} value The value to be checked
 * @returns {boolean} True if the value is one of the above, false otherwise
 */
export function isNumber(value: unknown): boolean {
  if(!typeofTest('number')(value) && !typeofTest('string')(value)) return false;
  if(isDigit(value)) return true;

  const str = String(value);

  if(
    ['+', '-'].includes(str[0]) &&
    /\d/.test(str.slice(1))
  ) return true;

  const hex = /^0x[0-9a-f]+$/i;
  const bin = /^0b[01]+$/i;
  const oct = /^0o[0-7]+$/i;

  return (
    hex.test(str.toLowerCase()) ||
    oct.test(str.toLowerCase()) ||
    bin.test(str)
  );
}


/**
 * Resolves a value to a number based on various conditions parsed from some of the following:
 * - A number (e.g. `123`)
 * - A string containing a number (e.g. `'123'`)
 * - A string containing a number with a leading `+` or `-` sign (e.g. `'+123'`, `'-123'`)
 * - A hexadecimal number (e.g. `0x123`)
 * - A binary number (e.g. `0b101`)
 * - An octal number (e.g. `0o123`)
 *
 * @param value - The value to be resolved to a number.
 * @returns The resolved number.
 * @throws {TypeError} If the value cannot be resolved to a number.
 */
export function resolveNumber(value: unknown): number {
  if(!isNumber(value)) {
    throw new TypeError(`Cannot resolve number from ${value}`);
  }

  if(isDigit(value)) return value;

  if(!isString(value)) {
    throw new TypeError(`Cannot resolve number from ${value}`);
  }

  if(value[0] === '+' || value[0] === '-') return value[0] === '+' ? +value.slice(1) : -value.slice(1);

  if(value.startsWith('0x')) return parseInt(value.toLowerCase(), 16);
  if(value.startsWith('0o')) return parseInt(value.toLowerCase(), 8);
  if(value.startsWith('0b')) return parseInt(value, 2);

  return parseInt(value, 10);
}


export function convertUint8ArrayToHex(arr: Uint8Array): string {
  return Array.prototype.map.call(arr, function(byte) {
    return ('0' + byte.toString(16)).slice(-2);
  }).join('');
}

export function now(): number {
  if(typeof performance !== 'undefined' &&
    typeof performance.now === 'function') return performance.now();

  return Date.now();
}