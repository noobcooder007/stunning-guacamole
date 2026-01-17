export interface ITokenHasher {
  hash(token: string): Promise<string>;
  safeCompare(token: string, hash: string): Promise<boolean>;
}
