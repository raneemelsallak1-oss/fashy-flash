import { bilt } from '@/lib/bilt';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/** Pulls the human-readable message out of a function error response. */
export async function messageFromFunctionError(error: unknown, fallback: string): Promise<string> {
  const context = isRecord(error) ? error.context : null;
  const jsonFn = isRecord(context) ? context.json : undefined;

  if (typeof jsonFn === 'function') {
    try {
      const body: unknown = await jsonFn.call(context);
      if (isRecord(body)) {
        const message = readString(body.message).trim();
        if (message.length > 0) return message;
      }
    } catch {
      // The error body was not JSON — fall back to the generic message.
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.includes('Edge Function') ? fallback : error.message;
  }

  return fallback;
}

/**
 * Calls a backend function and returns its payload, or throws an Error whose
 * message is safe to show the user. Every function in this app answers with
 * `{ ok, message?, ... }`, so a refused request reads as one plain sentence.
 */
export async function invokeFunction(
  name: string,
  body: Record<string, unknown>,
  fallback: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await bilt.functions.invoke(name, { body });
  if (error) throw new Error(await messageFromFunctionError(error, fallback));

  if (!isRecord(data)) throw new Error(fallback);

  if (data.ok !== true) {
    const message = readString(data.message).trim();
    throw new Error(message.length > 0 ? message : fallback);
  }

  return data;
}
