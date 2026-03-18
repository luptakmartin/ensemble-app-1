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
  timeTo: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
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
  status: z.enum(["yes", "maybe", "no", "unset"]).optional(),
  note: z.string().max(500).nullable().optional(),
  memberId: z.string().uuid().optional(),
}).refine(
  (data) => data.status !== undefined || data.note !== undefined,
  { message: "At least one of status or note must be provided" }
);

// Compositions
export const compositionSchema = z.object({
  name: z.string().min(1),
  author: z.string().min(1),
  duration: z.string().optional(),
});
export type CompositionInput = z.infer<typeof compositionSchema>;

// Attachments
export const attachmentSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url(),
  type: z.enum(["sheet", "audio"]),
  isLink: z.boolean(),
});
export type AttachmentInput = z.infer<typeof attachmentSchema>;

// Attachment update
export const attachmentUpdateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["sheet", "audio"]),
});
export type AttachmentUpdateInput = z.infer<typeof attachmentUpdateSchema>;

// Member profile
export const memberProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  voiceGroup: z.enum(["S", "A", "T", "B"]).nullable().optional(),
});
export type MemberProfileInput = z.infer<typeof memberProfileSchema>;

// Member invite
export const memberInviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["admin", "director", "member"]),
});
export type MemberInviteInput = z.infer<typeof memberInviteSchema>;

// Change password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Member roles
export const memberRolesSchema = z.object({
  roles: z.array(z.enum(["admin", "director", "member"])).min(1),
});
export type MemberRolesInput = z.infer<typeof memberRolesSchema>;
