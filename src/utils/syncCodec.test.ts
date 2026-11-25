import { describe, expect, it } from 'vitest';
import type { PersistedAppState } from '../types/tracker';
import {
  DEFAULT_APP_STATE,
  MAX_SYNC_CODE_LENGTH,
  decodeSyncCode,
  encodeSyncCode,
  validatePersistedState,
} from './syncCodec';

describe('syncCodec', () => {
  it('round-trips the default empty state cleanly', () => {
    const code = encodeSyncCode(DEFAULT_APP_STATE);
    const decoded = decodeSyncCode(code);
    expect(decoded).toEqual({ ok: true, state: DEFAULT_APP_STATE });
  });

  it('round-trips populated progress and tolerates whitespace around pasted codes', () => {
    const sample: PersistedAppState = {
      version: 1,
      checkedSlots: ['slot-1', 'slot-8', 'slot-9', 'slots-11-14', 'slot-15'],
      completedEndings: ['e1', 'e3', 'e8'],
      currentChapter: 5,
    };

    const code = encodeSyncCode(sample);
    const spaced = `  ${code.slice(0, 20)}\n  ${code.slice(20)}  `;
    const decoded = decodeSyncCode(spaced);
    expect(decoded).toEqual({ ok: true, state: sample });
  });

  it('deduplicates repeated valid IDs during validation', () => {
    const result = validatePersistedState({
      version: 1,
      checkedSlots: ['slot-1', 'slot-1', 'slot-2'],
      completedEndings: ['e1', 'e1'],
      currentChapter: 3,
    });

    expect(result).toEqual({
      ok: true,
      state: {
        version: 1,
        checkedSlots: ['slot-1', 'slot-2'],
        completedEndings: ['e1'],
        currentChapter: 3,
      },
    });
  });

  it('rejects empty, corrupted Base64, and non-JSON payloads', () => {
    expect(decodeSyncCode('   ').ok).toBe(false);
    expect(decodeSyncCode('not!valid@base64').ok).toBe(false);
    expect(decodeSyncCode('YWJjZA==').ok).toBe(false); // valid Base64 ("abcd"), invalid JSON
  });

  it('rejects wrong or missing schema versions', () => {
    const encodeRaw = (obj: unknown) =>
      btoa(JSON.stringify(obj));

    const v2 = decodeSyncCode(
      encodeRaw({ ...DEFAULT_APP_STATE, version: 2 })
    );
    expect(v2.ok).toBe(false);
    if (!v2.ok) {
      expect(v2.error).toContain('version');
    }

    const vString = decodeSyncCode(
      encodeRaw({ ...DEFAULT_APP_STATE, version: '1' })
    );
    expect(vString.ok).toBe(false);

    const vMissing = decodeSyncCode(
      encodeRaw({ checkedSlots: [], completedEndings: [], currentChapter: 1 })
    );
    expect(vMissing.ok).toBe(false);
  });

  it('rejects invalid chapters, unknown IDs, non-object JSON, and oversized inputs', () => {
    const encodeRaw = (obj: unknown) => btoa(JSON.stringify(obj));

    expect(decodeSyncCode(encodeRaw([1, 2, 3])).ok).toBe(false);
    expect(decodeSyncCode(encodeRaw(null)).ok).toBe(false);

    expect(
      decodeSyncCode(encodeRaw({ ...DEFAULT_APP_STATE, currentChapter: 0 })).ok
    ).toBe(false);
    expect(
      decodeSyncCode(encodeRaw({ ...DEFAULT_APP_STATE, currentChapter: 6 })).ok
    ).toBe(false);
    expect(
      decodeSyncCode(encodeRaw({ ...DEFAULT_APP_STATE, currentChapter: 2.5 }))
        .ok
    ).toBe(false);

    expect(
      decodeSyncCode(
        encodeRaw({ ...DEFAULT_APP_STATE, checkedSlots: ['slot-999'] })
      ).ok
    ).toBe(false);
    expect(
      decodeSyncCode(
        encodeRaw({ ...DEFAULT_APP_STATE, checkedSlots: [123] })
      ).ok
    ).toBe(false);

    expect(
      decodeSyncCode(
        encodeRaw({ ...DEFAULT_APP_STATE, completedEndings: ['e99'] })
      ).ok
    ).toBe(false);
    expect(
      decodeSyncCode(
        encodeRaw({ ...DEFAULT_APP_STATE, completedEndings: [null] })
      ).ok
    ).toBe(false);

    const oversized = 'A'.repeat(MAX_SYNC_CODE_LENGTH + 4);
    expect(decodeSyncCode(oversized).ok).toBe(false);
  });
});
