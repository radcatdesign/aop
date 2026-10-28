export function initialBetaAccess(
  verifiedEmail: string,
  bootstrapEmail: string | undefined,
  requestStatus: "pending" | "approved" | "rejected" | undefined,
) {
  const isBootstrap = Boolean(bootstrapEmail && verifiedEmail === bootstrapEmail);
  return {
    role: isBootstrap ? "admin" as const : "tester" as const,
    status: isBootstrap || requestStatus === "approved" ? "approved" as const :
      requestStatus === "rejected" ? "rejected" as const : "pending" as const,
  };
}

export function canChangeAdmin(
  actorId: string,
  targetId: string,
  currentRole: "admin" | "tester",
  currentStatus: string,
  nextRole: "admin" | "tester",
  nextStatus: string,
  approvedAdminCount: number,
) {
  if (actorId === targetId && (nextRole !== "admin" || nextStatus !== "approved")) return false;
  if (currentRole === "admin" && currentStatus === "approved" &&
      (nextRole !== "admin" || nextStatus !== "approved") && approvedAdminCount <= 1) return false;
  return true;
}