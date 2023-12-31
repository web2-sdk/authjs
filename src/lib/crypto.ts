import { ssrSafeWindow } from '../ssr';


export class Crypto {

  /**
   * Generate a random nonce
   * 
   * @param {number} [byteLength= 32] 
   * @returns {Promise<string>}
   */
  public static async nonce(byteLength: number = 32): Promise<string> {
    let arr: Uint8Array;

    if(ssrSafeWindow) {
      arr = crypto.getRandomValues(new Uint8Array(byteLength));
    } else {
      const __crypto = await import('crypto');
      arr = Uint8Array.from(__crypto.randomBytes(byteLength));
    }

    return Array.prototype.map.call(arr, function(byte) {
      return ('0' + byte.toString(16)).slice(-2);
    }).join('');
  }

  /**
   * Returns an Uint8Array filled with random bytes
   * 
   * @param {number} [length] 
   * @returns {Promise<Uint8Array>}
   */
  public static async randomBytes(length: number): Promise<Uint8Array> {
    if(ssrSafeWindow) return ssrSafeWindow.crypto.getRandomValues(new Uint8Array(length));

    const __crypto = await import('crypto');
    return Uint8Array.from(__crypto.randomBytes(length));
  }
  
  /**
   * Provides an asynchronous Password-Based Key Derivation Function 2 (PBKDF2) implementation
   * 
   * @param {string} thing 
   * @param {string} key 
   * @returns 
   */
  public static async pbkdf2(thing: string, key: string): Promise<string> {
    if(ssrSafeWindow) return CryptoJS.PBKDF2(thing, key, {
      iterations: 100000,
      keySize: 64,
      hasher: CryptoJS.algo.SHA512,
    }).toString(CryptoJS.enc.Hex);

    const __crypto = await import('crypto');

    return new Promise((resolve, reject) => {
      __crypto.pbkdf2(
        thing,
        key,
        100000,
        64,
        'sha512',
        (err, buffer) => {
          if(err) return reject(err);
          resolve(buffer.toString('hex'));
        } // eslint-disable-line comma-dangle
      );
    });
  }

  /**
   * Provides an asynchronous HMAC SHA-512 implementation
   * 
   * @param {string} data The data to be hashed 
   * @param {string} key The secret key 
   * @returns {string} The hashed data
   */
  public static async hmac512(data: string, key: string): Promise<string> {
    if(ssrSafeWindow) return CryptoJS.HmacSHA512(data, key).toString(CryptoJS.enc.Hex);
    
    const __crypto = await import('crypto');
    const hmac = __crypto.createHmac('sha512', key);
    hmac.update(data);
    return hmac.digest('hex');
  }
}