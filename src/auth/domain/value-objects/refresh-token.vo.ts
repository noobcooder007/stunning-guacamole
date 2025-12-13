export class RefreshToken {
  userId: string;
  hashedRefreshToken: string;
  sessionId: string;
  ip: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;

  constructor() {}

  public setUserId(userId: string): RefreshToken {
    this.userId = userId;
    return this;
  }

  public setHashRefreshToken(hash: string): RefreshToken {
    this.hashedRefreshToken = hash;
    return this;
  }

  public setSessionId(sessionId: string): RefreshToken {
    this.sessionId = sessionId;
    return this;
  }

  public setIp(ip: string): RefreshToken {
    this.ip = ip;
    return this;
  }

  public setUserAgent(userAgent: string): RefreshToken {
    this.userAgent = userAgent;
    return this;
  }

  public setExpiresAt(expiresAt: Date): RefreshToken {
    this.expiresAt = expiresAt;
    return this;
  }

  public setCreatedAt(createdAt: Date): RefreshToken {
    this.createdAt = createdAt;
    return this;
  }

  public build(): RefreshToken {
    return this;
  }
}
