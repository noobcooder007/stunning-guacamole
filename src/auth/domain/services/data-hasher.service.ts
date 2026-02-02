export interface IDataHasher {
  hash(token: string, usePepper?: boolean): Promise<string>;
  safeCompare(hash: string, plain: string): Promise<boolean>;
}
