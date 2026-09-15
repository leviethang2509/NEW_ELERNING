import { randomBytes } from 'node:crypto';
import { compare, hash } from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, passwordHash: string) {
  return compare(plain, passwordHash);
}

let dummyHash: Promise<string> | undefined;

/**
 * Hash ngẫu nhiên để vẫn chạy bcrypt khi email không tồn tại, tránh dò email
 * qua thời gian phản hồi của đăng nhập.
 */
export function getDummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
  return dummyHash;
}
