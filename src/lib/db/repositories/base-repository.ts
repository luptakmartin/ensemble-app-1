import { db } from "@/lib/db/drizzle";

export abstract class BaseRepository {
  protected readonly db = db;
  protected readonly ensembleId: string;

  constructor(ensembleId: string) {
    this.ensembleId = ensembleId;
  }
}
