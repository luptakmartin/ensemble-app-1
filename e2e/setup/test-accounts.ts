export const testAccounts = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL!,
    password: process.env.E2E_ADMIN_PASSWORD!,
  },
  director: {
    email: process.env.E2E_DIRECTOR_EMAIL!,
    password: process.env.E2E_DIRECTOR_PASSWORD!,
  },
  member: {
    email: process.env.E2E_MEMBER_EMAIL!,
    password: process.env.E2E_MEMBER_PASSWORD!,
  },
} as const;
