import * as argon2 from 'argon2';

export const hashString = async (plainText: string): Promise<string> => {
  return argon2.hash(plainText);
};

export const verifyHash = async (hash: string, plainText: string): Promise<boolean> => {
  return argon2.verify(hash, plainText);
};
