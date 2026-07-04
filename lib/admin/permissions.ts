import type { Role } from "@/lib/types";

/**
 * מפת הרשאות מרכזית:
 * admin — הכל. editor — תוכן בלבד. viewer — צפייה בלבד.
 */
export const PERMISSIONS = {
  viewAdmin: ["admin", "editor", "viewer"],
  writeContent: ["admin", "editor"],
  publishContent: ["admin", "editor"],
  hardDelete: ["admin"],
  manageSettings: ["admin"],
  manageUsers: ["admin"],
  manageMedia: ["admin", "editor"],
  readMessages: ["admin", "editor", "viewer"],
  handleMessages: ["admin", "editor"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const roleLabels: Record<Role, string> = {
  admin: "מנהל",
  editor: "עורך",
  viewer: "צופה",
};
