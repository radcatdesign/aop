import { getBetaGetMeQueryKey, useBetaGetMe } from "@workspace/api-client-react";
import { errorStatus } from "@/components/beta-ui";

/**
 * Current beta identity. Polls every 30s and on window focus so a suspension
 * or role change takes effect quickly. Never retries auth failures.
 */
export function useBetaMe(enabled = true) {
  return useBetaGetMe({
    query: {
      queryKey: getBetaGetMeQueryKey(),
      enabled,
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: "always",
      staleTime: 0,
      retry: (count, err) => {
        const s = errorStatus(err);
        if (s === 401 || s === 403 || s === 404) return false;
        return count < 1;
      },
    },
  });
}
