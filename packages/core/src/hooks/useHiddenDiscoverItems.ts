import { useCallback, useState } from 'react';

const STORAGE_KEY = 'pelagica_discover_hidden_items';

function readHiddenKeys(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch {
        return new Set();
    }
}

function writeHiddenKeys(keys: Set<string>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(keys)));
}

export interface UseHiddenDiscoverItemsResult {
    /** Keys of Discover items the user chose to hide, formatted `${mediaType}-${tmdbId}`. */
    hiddenKeys: Set<string>;
    /** Hides an item by key and persists the choice to `localStorage`. */
    hideItem: (key: string) => void;
}

/**
 * Tracks Discover items the user has chosen to never see again. This is
 * per-browser only (persisted to `localStorage`, not synced to the Jellyfin
 * server or any account) — an accepted tradeoff so the feature needs no
 * backend support. There is currently no UI to un-hide an item; hiding is a
 * one-way action from the Discover section.
 */
export function useHiddenDiscoverItems(): UseHiddenDiscoverItemsResult {
    const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() => readHiddenKeys());

    const hideItem = useCallback((key: string) => {
        setHiddenKeys((prev) => {
            if (prev.has(key)) return prev;
            const next = new Set(prev);
            next.add(key);
            writeHiddenKeys(next);
            return next;
        });
    }, []);

    return { hiddenKeys, hideItem };
}
