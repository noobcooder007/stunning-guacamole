export class RefreshSessionCommand {
  sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
}
