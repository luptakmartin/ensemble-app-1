import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { ensembles } from "@/lib/db/schema";

export type Ensemble = typeof ensembles.$inferSelect;

export class EnsembleRepository {
  private readonly db = db;

  async findById(id: string): Promise<Ensemble | null> {
    const result = await this.db
      .select()
      .from(ensembles)
      .where(eq(ensembles.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findAll(): Promise<Ensemble[]> {
    return this.db.select().from(ensembles);
  }
}
