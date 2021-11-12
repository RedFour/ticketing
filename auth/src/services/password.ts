import { scryptSync, randomBytes } from 'crypto';

export class PasswordService {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = await scryptSync(password, salt, 64);

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = await scryptSync(suppliedPassword, salt, 64);

    return buf.toString('hex') === hashedPassword;
  }
}
