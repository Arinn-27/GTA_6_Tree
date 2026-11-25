import { describe, expect, it } from 'vitest';
import { ENDINGS, resolveEnding } from './endings';

describe('ENDINGS catalog', () => {
  it('defines all 8 unique endings e1-e8', () => {
    expect(ENDINGS).toHaveLength(8);
    expect(ENDINGS.map((e) => e.id)).toEqual([
      'e1',
      'e2',
      'e3',
      'e4',
      'e5',
      'e6',
      'e7',
      'e8',
    ]);
  });

  it('has preset inputs that deterministically resolve to each ending itself', () => {
    for (const ending of ENDINGS) {
      const result = resolveEnding(ending.presetInput);
      expect(result.isComplete).toBe(true);
      expect(result.ending?.id).toBe(ending.id);
    }
  });
});

describe('resolveEnding', () => {
  it('resolves e1 (Best) for Route A + Clean + $2M+ + Shoot + Swim + Exit', () => {
    const result = resolveEnding({
      route: 'route-a',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'swim',
      step4: 'exit',
    });

    expect(result.isComplete).toBe(true);
    expect(result.ending?.id).toBe('e1');
    expect(result.ending?.tierLabel).toBe('Best');
  });

  it('resolves e2 (Good A) for Route A + Clean + Under $2M + Shoot + Swim + Exit', () => {
    for (const savings of ['under-500k', '500k-to-2m'] as const) {
      const result = resolveEnding({
        route: 'route-a',
        profile: 'clean',
        savings,
        step2: 'shoot',
        step3: 'swim',
        step4: 'exit',
      });
      expect(result.isComplete).toBe(true);
      expect(result.ending?.id).toBe('e2');
    }
  });

  it('resolves e3 (Good B) for Route B + Clean + Take Deal with $500k+ bonus epilogue note only when >= $500k', () => {
    const withoutBonus = resolveEnding({
      route: 'route-b',
      profile: 'clean',
      savings: 'under-500k',
      step2: 'take-deal',
    });
    expect(withoutBonus.ending?.id).toBe('e3');
    expect(withoutBonus.bonusEpilogueNote).toBeUndefined();
    expect(withoutBonus.availableStep3Choices).toEqual([]);

    for (const savings of ['500k-to-2m', '2m-plus'] as const) {
      const withBonus = resolveEnding({
        route: 'route-b',
        profile: 'clean',
        savings,
        step2: 'take-deal',
      });
      expect(withBonus.ending?.id).toBe('e3');
      expect(withBonus.bonusEpilogueNote).toContain('$500K+');
    }
  });

  it('resolves e4 (Bad A) for Route A + Shoot + Swim on Expire OR Chaos profile', () => {
    const cleanExpire = resolveEnding({
      route: 'route-a',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'swim',
      step4: 'expire',
    });
    expect(cleanExpire.ending?.id).toBe('e4');

    const chaosExit = resolveEnding({
      route: 'route-a',
      profile: 'chaos',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'swim',
      step4: 'exit',
    });
    expect(chaosExit.ending?.id).toBe('e4');
    expect(chaosExit.warningNote).toContain('Chaos profile');

    const chaosExpire = resolveEnding({
      route: 'route-a',
      profile: 'chaos',
      savings: 'under-500k',
      step2: 'shoot',
      step3: 'swim',
      step4: 'expire',
    });
    expect(chaosExpire.ending?.id).toBe('e4');
  });

  it('resolves e5 (Bad B) for Route A + Shoot + No Surrender regardless of profile or savings', () => {
    const res = resolveEnding({
      route: 'route-a',
      profile: 'chaos',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'no-surrender',
    });
    expect(res.ending?.id).toBe('e5');
    expect(res.requiresStep4).toBe(false);
  });

  it('resolves e6 (Stay Down) and e7 (Defend) on Route B + Shoot with launch-week verification note', () => {
    const stayDown = resolveEnding({
      route: 'route-b',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'stay-down',
    });
    expect(stayDown.ending?.id).toBe('e6');
    expect(stayDown.verificationNote).toContain('Launch-week verification note');

    const defend = resolveEnding({
      route: 'route-b',
      profile: 'chaos',
      savings: 'under-500k',
      step2: 'shoot',
      step3: 'defend',
    });
    expect(defend.ending?.id).toBe('e7');
    expect(defend.verificationNote).toContain('Launch-week verification note');
  });

  it('handles Route B + Chaos + Take Deal edge case cleanly with warning and standoff resolution', () => {
    const res = resolveEnding({
      route: 'route-b',
      profile: 'chaos',
      savings: '2m-plus',
      step2: 'take-deal',
      step3: 'stay-down',
    });
    expect(res.ending?.id).toBe('e6');
    expect(res.warningNote).toContain('disqualifies Good B');
    expect(res.verificationNote).toContain('Launch-week verification note');
  });

  it('resolves e8 (Worst: Hidden Deal) immediately on Route A + Take Deal without Step 3', () => {
    const res = resolveEnding({
      route: 'route-a',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'take-deal',
      step3: 'swim',
      step4: 'exit',
    });
    expect(res.ending?.id).toBe('e8');
    expect(res.availableStep3Choices).toEqual([]);
    expect(res.requiresStep4).toBe(false);
  });

  it('returns incomplete resolution when required Step 3 or Step 4 is missing or mismatched', () => {
    const missingStep3RouteA = resolveEnding({
      route: 'route-a',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'stay-down', // mismatched from Route B
    });
    expect(missingStep3RouteA.isComplete).toBe(false);
    expect(missingStep3RouteA.ending).toBeNull();
    expect(missingStep3RouteA.nextRequiredStep).toBe('step3');
    expect(missingStep3RouteA.availableStep3Choices).toEqual([
      'swim',
      'no-surrender',
    ]);

    const missingStep4 = resolveEnding({
      route: 'route-a',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'swim',
    });
    expect(missingStep4.isComplete).toBe(false);
    expect(missingStep4.ending).toBeNull();
    expect(missingStep4.nextRequiredStep).toBe('step4');
    expect(missingStep4.requiresStep4).toBe(true);

    const missingStep3RouteB = resolveEnding({
      route: 'route-b',
      profile: 'clean',
      savings: 'under-500k',
      step2: 'shoot',
      step3: 'swim', // mismatched from Route A
    });
    expect(missingStep3RouteB.isComplete).toBe(false);
    expect(missingStep3RouteB.ending).toBeNull();
    expect(missingStep3RouteB.nextRequiredStep).toBe('step3');
    expect(missingStep3RouteB.availableStep3Choices).toEqual([
      'stay-down',
      'defend',
    ]);
  });
});
