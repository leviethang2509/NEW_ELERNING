import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/** Healthcheck cho Docker: API sống và kết nối được database. */
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const startedAt = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('Không kết nối được database');
    }
    return {
      status: 'ok',
      database: 'up',
      latencyMs: Date.now() - startedAt,
    };
  }
}
