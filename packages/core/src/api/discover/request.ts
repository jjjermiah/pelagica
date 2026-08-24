import type { DiscoverRequestPayload } from './types';

/**
 * Submits a request for a Discover item (movie or TV show) via the backend
 * `/api/discover/request` endpoint. Throws on any non-2xx response,
 * preferring the backend's `{ error }` message body when present.
 */
export async function requestDiscoverItem(payload: DiscoverRequestPayload): Promise<void> {
    const response = await fetch('/api/discover/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let message = `Failed to request item (${response.status})`;
        try {
            const data = (await response.json()) as { error?: string };
            if (data?.error) message = data.error;
        } catch {
            // Ignore non-JSON error bodies, fall back to the status message above.
        }
        throw new Error(message);
    }
}
