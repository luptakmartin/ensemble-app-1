import { eq, and, asc, inArray } from "drizzle-orm";
import { BaseRepository } from "./base-repository";
import { compositions, eventCompositions } from "@/lib/db/schema";

export type Composition = typeof compositions.$inferSelect;

export type CreateCompositionData = {
  name: string;
  author: string;
  duration?: string;
};

export type UpdateCompositionData = Partial<CreateCompositionData>;

export class CompositionRepository extends BaseRepository {
  async findAll(): Promise<Composition[]> {
    return this.db
      .select()
      .from(compositions)
      .where(eq(compositions.ensembleId, this.ensembleId))
      .orderBy(asc(compositions.name));
  }

  async findById(id: string): Promise<Composition | null> {
    const rows = await this.db
      .select()
      .from(compositions)
      .where(
        and(eq(compositions.id, id), eq(compositions.ensembleId, this.ensembleId))
      );

    return rows[0] ?? null;
  }

  async findByEvent(eventId: string): Promise<Composition[]> {
    return this.db
      .select({
        id: compositions.id,
        ensembleId: compositions.ensembleId,
        name: compositions.name,
        author: compositions.author,
        duration: compositions.duration,
        createdAt: compositions.createdAt,
        updatedAt: compositions.updatedAt,
      })
      .from(eventCompositions)
      .innerJoin(compositions, eq(compositions.id, eventCompositions.compositionId))
      .where(
        and(
          eq(eventCompositions.eventId, eventId),
          eq(compositions.ensembleId, this.ensembleId)
        )
      )
      .orderBy(asc(compositions.name));
  }

  async findLinkedToAnyEvent(): Promise<Composition[]> {
    const linkedIds = await this.db
      .selectDistinct({ compositionId: eventCompositions.compositionId })
      .from(eventCompositions)
      .innerJoin(compositions, eq(compositions.id, eventCompositions.compositionId))
      .where(eq(compositions.ensembleId, this.ensembleId));

    if (linkedIds.length === 0) return [];

    return this.db
      .select()
      .from(compositions)
      .where(
        and(
          eq(compositions.ensembleId, this.ensembleId),
          inArray(
            compositions.id,
            linkedIds.map((r) => r.compositionId)
          )
        )
      )
      .orderBy(asc(compositions.name));
  }

  async create(data: CreateCompositionData): Promise<Composition> {
    const [inserted] = await this.db
      .insert(compositions)
      .values({
        ensembleId: this.ensembleId,
        ...data,
      })
      .returning();

    return inserted;
  }

  async update(id: string, data: UpdateCompositionData): Promise<Composition> {
    const [updated] = await this.db
      .update(compositions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(eq(compositions.id, id), eq(compositions.ensembleId, this.ensembleId))
      )
      .returning();

    if (!updated) {
      throw new Error(`Composition ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(compositions)
      .where(
        and(eq(compositions.id, id), eq(compositions.ensembleId, this.ensembleId))
      );
  }

  async linkToEvent(compositionId: string, eventId: string): Promise<void> {
    await this.db
      .insert(eventCompositions)
      .values({ compositionId, eventId })
      .onConflictDoNothing();
  }

  async unlinkFromEvent(compositionId: string, eventId: string): Promise<void> {
    await this.db
      .delete(eventCompositions)
      .where(
        and(
          eq(eventCompositions.compositionId, compositionId),
          eq(eventCompositions.eventId, eventId)
        )
      );
  }
}
