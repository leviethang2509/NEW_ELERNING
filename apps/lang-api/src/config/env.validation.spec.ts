import { validateEnv } from './env.validation';

const base = {
  DB_HOST: '127.0.0.1',
  DB_USERNAME: 'postgres',
  DB_NAME: 'lang_simulator_dev',
  JWT_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('áp giá trị mặc định và ép kiểu số', () => {
    const env = validateEnv({ ...base, PORT: '4000' });
    expect(env.PORT).toBe(4000);
    expect(env.DB_PORT).toBe(5432);
    expect(env.DB_PASSWORD).toBe('');
    expect(env.DB_SCHEMA).toBe('public');
    expect(env.DB_LOGGING).toBe(false);
    expect(env.NODE_ENV).toBe('development');
  });

  it('thời hạn token và cookie có giá trị mặc định', () => {
    const env = validateEnv(base);
    expect(env.JWT_ACCESS_EXPIRES_IN).toBe('15m');
    expect(env.REFRESH_EXPIRES_IN).toBe('30d');
    expect(env.COOKIE_SECURE).toBe(false);
    expect(validateEnv({ ...base, COOKIE_SECURE: 'true' }).COOKIE_SECURE).toBe(
      true,
    );
  });

  it('thời hạn token sai định dạng thì dừng', () => {
    expect(() =>
      validateEnv({ ...base, JWT_ACCESS_EXPIRES_IN: '15 phút' }),
    ).toThrow(/JWT_ACCESS_EXPIRES_IN/);
  });

  it('đọc DB_LOGGING dạng chuỗi', () => {
    expect(validateEnv({ ...base, DB_LOGGING: 'true' }).DB_LOGGING).toBe(true);
  });

  it('thiếu JWT_SECRET thì dừng', () => {
    const { JWT_SECRET: _omit, ...rest } = base;
    expect(() => validateEnv(rest)).toThrow(/JWT_SECRET/);
  });

  it('JWT_SECRET ngắn hơn 32 ký tự thì dừng', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('DB_SCHEMA có ký tự không an toàn thì dừng', () => {
    expect(() =>
      validateEnv({ ...base, DB_SCHEMA: 'lang; drop schema public' }),
    ).toThrow(/DB_SCHEMA/);
  });

  it('PORT không phải số thì dừng', () => {
    expect(() => validateEnv({ ...base, PORT: 'abc' })).toThrow(/PORT/);
  });
});
