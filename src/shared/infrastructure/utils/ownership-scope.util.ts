export interface OwnershipScope {
  beneficientId?: string;
  collectorId?: string;
}

export function getOwnershipScope(user: any): OwnershipScope {
  return {
    beneficientId: user?.beneficientId,
    collectorId: user?.collectorId,
  };
}
