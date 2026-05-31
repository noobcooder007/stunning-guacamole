export class PrintCollectorLetterCommand {
  constructor(
    public readonly month: number,
    public readonly year: number,
    public readonly userId: string,
    public readonly collectorNumber?: number,
  ) {}
}
