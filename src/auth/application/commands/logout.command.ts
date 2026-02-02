export class LogoutCommand {
  sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
}
