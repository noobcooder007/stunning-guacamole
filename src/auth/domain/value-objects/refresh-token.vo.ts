export class RefreshToken {
  userId: string;
  hashedRefreshToken: string;
  expiresAt: string;
  createdAt: string;

  constructor() {}

  public setUserId(userId: string): RefreshToken {
    this.userId = userId;
    return this;
  }

  public setHashRefreshToken(hash: string): RefreshToken {
    this.hashedRefreshToken = hash;
    return this;
  }

  public setExpiresAt(expiresAt: string): RefreshToken {
    this.expiresAt = expiresAt;
    return this;
  }

  public setCreatedAt(createdAt: string): RefreshToken {
    this.createdAt = createdAt;
    return this;
  }

  public build(): RefreshToken {
    return this;
  }
}
