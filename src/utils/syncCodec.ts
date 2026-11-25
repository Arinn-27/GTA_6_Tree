import { VALID_ENDING_IDS } from '../data/endings';
import { VALID_SLOT_IDS } from '../data/saveSlots';
import type { ChapterNumber, PersistedAppState } from '../types/tracker';

export const MAX_SYNC_CODE_LENGTH = 8192;

export const DEFAULT_APP_STATE: PersistedAppState = {
  version: 1,
  checkedSlots: [],
  completedEndings: [],
  currentChapter: 1,
};

export type StateValidationResult =
  | { ok: true; state: PersistedAppState }
  | { ok: false; error: string };

function isValidChapter(value: unknown): value is ChapterNumber {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function validateIdArray(
  value: unknown,
  allowedIds: ReadonlySet<string>,
  fieldName: string
): { ok: true; ids: string[] } | { ok: false; error: string } {
  if (!Array.isArray(value)) {
    return { ok: false, error: `Invalid ${fieldName}: expected an array.` };
  }

  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      return {
        ok: false,
        error: `Invalid ${fieldName}: all entries must be strings.`,
      };
    }
    if (!allowedIds.has(item)) {
      return {
        ok: false,
        error: `Invalid ${fieldName}: unrecognized ID "${item}".`,
      };
    }
    if (!seen.has(item)) {
      seen.add(item);
      deduped.push(item);
    }
  }

  return { ok: true, ids: deduped };
}

/**
 * Strictly validates an unknown parsed value against the v1 PersistedAppState schema.
 */
export function validatePersistedState(raw: unknown): StateValidationResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {
      ok: false,
      error: 'Invalid backup format: expected a JSON object.',
    };
  }

  const record = raw as Record<string, unknown>;

  if (record.version !== 1) {
    const found =
      record.version === undefined ? 'missing' : String(record.version);
    return {
      ok: false,
      error: `Unsupported backup schema version (${found}). Expected version 1.`,
    };
  }

  if (!isValidChapter(record.currentChapter)) {
    return {
      ok: false,
      error: 'Invalid currentChapter: expected an integer between 1 and 5.',
    };
  }

  const slotsCheck = validateIdArray(
    record.checkedSlots,
    VALID_SLOT_IDS,
    'checkedSlots'
  );
  if (!slotsCheck.ok) {
    return slotsCheck;
  }

  const endingsCheck = validateIdArray(
    record.completedEndings,
    VALID_ENDING_IDS,
    'completedEndings'
  );
  if (!endingsCheck.ok) {
    return endingsCheck;
  }

  return {
    ok: true,
    state: {
      version: 1,
      checkedSlots: slotsCheck.ids,
      completedEndings: endingsCheck.ids,
      currentChapter: record.currentChapter,
    },
  };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes a validated PersistedAppState into a compact UTF-8 Base64 sync string.
 */
export function encodeSyncCode(state: PersistedAppState): string {
  const checked = validatePersistedState(state);
  if (!checked.ok) {
    throw new Error(checked.error);
  }
  const json = JSON.stringify(checked.state);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64(bytes);
}

/**
 * Decodes and strictly validates a Base64 sync code pasted by the user.
 */
export function decodeSyncCode(rawInput: string): StateValidationResult {
  const compact = rawInput.replace(/\s+/g, '');

  if (compact.length === 0) {
    return { ok: false, error: 'Sync code is empty.' };
  }

  if (compact.length > MAX_SYNC_CODE_LENGTH) {
    return {
      ok: false,
      error: `Sync code exceeds maximum length of ${MAX_SYNC_CODE_LENGTH} characters.`,
    };
  }

  if (compact.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) {
    return {
      ok: false,
      error: 'Corrupted sync code: not a valid Base64 string.',
    };
  }

  let jsonText: string;
  try {
    const bytes = base64ToBytes(compact);
    jsonText = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return {
      ok: false,
      error: 'Corrupted sync code: unable to decode Base64 UTF-8 payload.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      error: 'Corrupted sync code: payload is not valid JSON.',
    };
  }

  return validatePersistedState(parsed);
}
