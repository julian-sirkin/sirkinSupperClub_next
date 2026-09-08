import { toast } from "react-toastify";
import { interpretSyncResponse } from "./interpretSyncResponse";

export const syncEvents = async (): Promise<boolean> => {
  const toastId = toast.loading("Syncing events from Contentful...");

  try {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    let data: { message?: string; error?: string; warnings?: unknown; details?: unknown } = {};

    try {
      data = await response.json();
    } catch {
      toast.update(toastId, {
        render: response.ok
          ? "Events likely synced, but the server took too long to reply. Refresh to confirm."
          : "Could not sync events.",
        type: response.ok ? "warning" : "error",
        isLoading: false,
        autoClose: 6000,
      });
      return response.ok;
    }

    const result = interpretSyncResponse(response.status, data);

    toast.update(toastId, {
      render: result.message,
      type: result.kind === "error" ? "error" : result.kind,
      isLoading: false,
      autoClose: result.kind === "error" ? 8000 : 4000,
    });

    return result.ok;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach the server.";

    toast.update(toastId, {
      render: message,
      type: "error",
      isLoading: false,
      autoClose: 8000,
    });

    return false;
  }
};
