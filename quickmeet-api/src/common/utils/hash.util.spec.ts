import { hashString, verifyHash } from './hash.util';

describe('Hash Utility', () => {
  it('should hash and verify successfully', async () => {
    const plainText = 'mySecretPassword';
    const hash = await hashString(plainText);
    
    expect(hash).not.toEqual(plainText);
    
    const isValid = await verifyHash(hash, plainText);
    expect(isValid).toBe(true);
  });

  it('should fail verification with wrong text', async () => {
    const plainText = 'mySecretPassword';
    const hash = await hashString(plainText);
    
    const isValid = await verifyHash(hash, 'wrongPassword');
    expect(isValid).toBe(false);
  });
});
