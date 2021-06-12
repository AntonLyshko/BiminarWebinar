import { useEffect } from "react";

export function useBeforeUnload(callback) {
  useEffect(() => {
    window.addEventListener("beforeunload", callback);
    return () => window.removeEventListener("beforeunload", callback);
  }, []);
}
