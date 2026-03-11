import { z } from "zod";

// Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Events
export const eventSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    "regular_rehearsal",
    "exceptional_rehearsal",
    "general_rehearsal",
    "concert",
    "meeting",
  ]),
  date: z.string().datetime(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  place: z.string().min(1),
  description: z.string().optional(),
});
export type EventInput = z.infer<typeof eventSchema>;

// Attendance
export const attendanceSchema = z.object({
  status: z.enum(["yes", "maybe", "no", "unset"]),
});
export type AttendanceInput = z.infer<typeof attendanceSchema>;

export const attendanceUpdateSchema = z.object({
  status: z.enum(["yes", "maybe", "no", "unset"]),
  memberId: z.string().uuid().optional(),
});

// Compositions
export const compositionSchema = z.object({
  name: z.string().min(1),
  author: z.string().min(1),
  duration: z.string().optional(),
});
export type CompositionInput = z.infer<typeof compositionSchema>;

// Attachments
export const attachmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.enum(["sheet", "audio"]),
  isLink: z.boolean(),
});
export type AttachmentInput = z.infer<typeof attachmentSchema>;

// Member profile
export const memberProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});
export type MemberProfileInput = z.infer<typeof memberProfileSchema>;

// Member invite
export const memberInviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["admin", "director", "member"]),
});
export type MemberInviteInput = z.infer<typeof memberInviteSchema>;
