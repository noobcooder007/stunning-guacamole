export class GetCollectorByIdQuery {
  id: string;
  scopedCollectorId?: string;

  constructor(id: string, scopedCollectorId?: string) {
    this.id = id;
    this.scopedCollectorId = scopedCollectorId;
  }
}
