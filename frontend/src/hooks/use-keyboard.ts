import { useEffect, useRef } from "react";

/**
 * Custom hook to trigger actions on specific keyboard shortcuts.
 * Perfect for adding "Cmd+Enter" to run analysis like Linear/Cursor.
 *
 * Uses a ref internally so the callback identity doesn't cause
 * repeated event-listener re-registration.
 */
export function useKeyboardShortcut(
  key: string,
  ctrlOrMeta: boolean,
  callback: () => void
) {
  // Store the latest callback in a ref so the effect doesn't re-run
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifierMatch = ctrlOrMeta
        ? event.metaKey || event.ctrlKey
        : true;

      if (modifierMatch && event.key.toLowerCase() === key.toLowerCase()) {
        // Don't fire inside input/textarea elements
        const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;

        event.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, ctrlOrMeta]);
  // Note: callback is NOT in the deps — we use a ref instead
}
