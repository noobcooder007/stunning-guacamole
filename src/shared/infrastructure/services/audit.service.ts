import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import {
  AuditLogSchema,
  AuditStatus,
} from '@/shared/infrastructure/persistence/audit-log.schema';

export interface AuditEntry {
  traceId?: string;
  userId?: string;
  operation: string;
  status: AuditStatus;
  errorMessage?: string;
  durationMs: number;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly dataSource: DataSource) {}

  async log(entry: AuditEntry): Promise<void> {
    // Use a dedicated queryRunner so audit entries survive transaction rollbacks
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    try {
      await qr.manager.save(AuditLogSchema, {
        id: uuidv7(),
        traceId: entry.traceId ?? null,
        userId: entry.userId ?? null,
        operation: entry.operation,
        status: entry.status,
        errorMessage: entry.errorMessage ?? null,
        durationMs: entry.durationMs,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        createdAt: new Date(),
      });
    } finally {
      await qr.release();
    }
  }
}
