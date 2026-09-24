export function readExecutionProfile() {
  if (process.env.MANAGED_LINUX === "true") return "managed-linux";
  return "local";
}
