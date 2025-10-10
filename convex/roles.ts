export type Role = "user" | "admin" | "owner";

const order: Role[] = ["user", "admin", "owner"];

export function hasRoleAtLeast(role: Role, required: Role): boolean {
  return order.indexOf(role) >= order.indexOf(required);
}


