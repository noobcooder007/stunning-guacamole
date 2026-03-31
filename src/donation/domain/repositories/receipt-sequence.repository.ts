export interface IReceiptSequenceRepository {
  getNextSequenceWithLock(
    collectorId: string,
    type: string,
    year: number,
  ): Promise<number>;

  getCollectorShortCode(collectorId: string): Promise<string>;
}
