export function isIncubatorRole(role: string | undefined | null): boolean {
  return role === "INCUBATOR_ADMIN" || role === "SUPER_ADMIN";
}
