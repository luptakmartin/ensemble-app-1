// ── Enums ──

export const EventType = {
  REGULAR_REHEARSAL: "regular_rehearsal",
  EXCEPTIONAL_REHEARSAL: "exceptional_rehearsal",
  GENERAL_REHEARSAL: "general_rehearsal",
  CONCERT: "concert",
  MEETING: "meeting",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export const PresenceStatus = {
  YES: "yes",
  MAYBE: "maybe",
  NO: "no",
  UNSET: "unset",
} as const;

export type PresenceStatus = (typeof PresenceStatus)[keyof typeof PresenceStatus];

export const VoiceGroup = {
  SOPRANO: "S",
  ALTO: "A",
  TENOR: "T",
  BASS: "B",
} as const;

export type VoiceGroup = (typeof VoiceGroup)[keyof typeof VoiceGroup];

export const UserRole = {
  ADMIN: "admin",
  DIRECTOR: "director",
  MEMBER: "member",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ── Domain Entities ──

export interface Ensemble {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  ensembleId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  voiceGroup?: VoiceGroup;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EnsembleEvent {
  id: string;
  ensembleId: string;
  name: string;
  type: EventType;
  date: Date;
  time: string;
  place: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  memberId: string;
  status: PresenceStatus;
  updatedAt: Date;
}

export interface Composition {
  id: string;
  ensembleId: string;
  name: string;
  author: string;
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  compositionId: string;
  type: "sheet" | "audio";
  name: string;
  url: string;
  isLink: boolean;
  createdAt: Date;
}
