export type SyncClientResult = {
  ok: boolean;
  kind: "success" | "warning" | "error";
  message: string;
};

export const interpretSyncResponse = (
  status: number,
  data: {
    message?: string;
    error?: string;
    warnings?: unknown;
    details?: unknown;
  }
): SyncClientResult => {
  if (status === 401) {
    return {
      ok: false,
      kind: "error",
      message: "Please log in again to sync events.",
    };
  }

  const warnings = Array.isArray(data.warnings)
    ? data.warnings
    : Array.isArray(data.details)
      ? data.details
      : [];

  if (status >= 200 && status < 300) {
    if (warnings.length > 0) {
      return {
        ok: true,
        kind: "warning",
        message: `Events synced, with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`,
      };
    }

    return {
      ok: true,
      kind: "success",
      message: data.message || "Events synced.",
    };
  }

  return {
    ok: false,
    kind: "error",
    message: data.error || data.message || "Failed to sync events.",
  };
};
