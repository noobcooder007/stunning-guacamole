import { ReceiptFolio } from '@/donation/domain/aggregates/receipt.aggregate';
import { IReceiptSequenceRepository } from '@/donation/domain/repositories/receipt-sequence.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ReceiptFolioProvider {
  constructor(
    @Inject('IReceiptSequenceRepository')
    private readonly receiptSequenceRepository: IReceiptSequenceRepository,
  ) {}

  private readonly MONTHS = [
    'ENE',
    'FEB',
    'MAR',
    'ABR',
    'MAY',
    'JUN',
    'JUL',
    'AGO',
    'SEP',
    'OCT',
    'NOV',
    'DIC',
  ];

  private readonly TYPE_PREFIX = {
    RECURRING: 'R',
    SPECIAL: 'S',
    IN_BLANK: 'B',
  };

  async generateNext(collectorId: string, type: string): Promise<ReceiptFolio> {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();

    const [shortCode, sequence] = await Promise.all([
      this.receiptSequenceRepository.getCollectorShortCode(collectorId),
      this.receiptSequenceRepository.getNextSequenceWithLock(
        collectorId,
        type,
        year,
      ),
    ]);

    const period = `${this.MONTHS[monthIndex]}${year}`;
    const typeLetter = this.TYPE_PREFIX[type];
    const sequenceStr = sequence.toString().padStart(4, '0');

    return ReceiptFolio.of(
      `${period}-${shortCode}-${typeLetter}-${sequenceStr}`,
    );
  }
}
