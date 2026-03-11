import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { attachments } from "@/lib/db/schema";

export type Attachment = typeof attachments.$inferSelect;

export type CreateAttachmentData = {
  compositionId: string;
  type: Attachment["type"];
  name: string;
  url: string;
  isLink: boolean;
};

export class AttachmentRepository {
  private readonly db = db;

  async findByComposition(compositionId: string): Promise<Attachment[]> {
    return this.db
      .select()
      .from(attachments)
      .where(eq(attachments.compositionId, compositionId))
      .orderBy(asc(attachments.type), asc(attachments.name));
  }

  async findById(id: string): Promise<Attachment | null> {
    const rows = await this.db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id));

    return rows[0] ?? null;
  }

  async create(data: CreateAttachmentData): Promise<Attachment> {
    const [inserted] = await this.db
      .insert(attachments)
      .values(data)
      .returning();

    return inserted;
  }

  async delete(id: string): Promise<Attachment | null> {
    const [deleted] = await this.db
      .delete(attachments)
      .where(eq(attachments.id, id))
      .returning();

    return deleted ?? null;
  }
}
