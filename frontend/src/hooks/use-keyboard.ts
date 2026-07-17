import { useEffect } from 'react';

/**
 * Custom hook to trigger actions on specific keyboard shortcuts.
 * Perfect for adding "Cmd+Enter" to run analysis like Linear/Cursor.
 */
export function useKeyboardShortcut(key: string, ctrlOrMeta: boolean, callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifierMatch = ctrlOrMeta ? (event.metaKey || event.ctrlKey) : true;
      
      if (modifierMatch && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlOrMeta, callback]);
}