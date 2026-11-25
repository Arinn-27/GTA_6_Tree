import type {
  EndingDefinition,
  EndingId,
  EndingResolution,
  EndingSimulationInput,
  Step3Choice,
} from '../types/tracker';

const LAUNCH_WEEK_VERIFICATION_NOTE =
  'Launch-week verification note: Community reports vary on whether this Route B standoff triggers strictly after Shoot or also under Take Deal with a Chaos criminal profile. Verify exact triggers on your current game patch.';

const E3_BONUS_EPILOGUE_NOTE =
  '$500K+ Bonus Epilogue: Holding at least $500,000 in BuckMe! Family Savings unlocks an extended bonus epilogue beat on Good B (e3).';

export const ENDINGS: readonly EndingDefinition[] = [
  {
    id: 'e1',
    code: 'E1',
    name: 'Best Ending',
    tierLabel: 'Best',
    tier: 'best',
    route: 'route-a',
    recipeTags: [
      'Route A',
      'Clean Profile',
      'BuckMe! $2M+',
      'Shoot',
      'Swim',
      'Exit',
    ],
    unlockSteps: [
      'Maintain a Strong Relationship across Chapters 1–5 (Route A).',
      'Keep a Clean (Professional) Criminal Profile without shattering.',
      'Hold $2,000,000+ in BuckMe! Family Savings.',
      'During Protective Custody, choose "Shoot", then "Swim", and reach "Exit" before the timer expires.',
    ],
    spoilerSummary:
      'Jason and Lucia survive the Leonida Keys bridge ambush, dive clear of the gunfire, and make a clean escape. Two years later, Abe funnels their $2M+ Family Savings offshore so they reunite with Lucia’s family for a genuine fresh start.',
    presetInput: {
      route: 'route-a',
      profile: 'clean',
      savings: '2m-plus',
      step2: 'shoot',
      step3: 'swim',
      step4: 'exit',
    },
  },
  {
    id: 'e2',
    code: 'E2',
    name: 'Good Ending A',
    tierLabel: 'Good A',
    tier: 'good',
    route: 'route-a',
    recipeTags: [
      'Route A',
      'Clean Profile',
      'BuckMe! Under $2M',
      'Shoot',
      'Swim',
      'Exit',
    ],
    unlockSteps: [
      'Maintain a Strong Relationship across Chapters 1–5 (Route A).',
      'Keep a Clean (Professional) Criminal Profile.',
      'Hold under $2,000,000 in BuckMe! Family Savings.',
      'Choose "Shoot", then "Swim", and reach "Exit" before the escape timer runs out.',
    ],
    spoilerSummary:
      'Jason and Lucia survive the bridge swim and evade law enforcement with their bond intact, but without $2M in Family Savings they remain on the run in hiding without the clean offshore reset.',
    presetInput: {
      route: 'route-a',
      profile: 'clean',
      savings: '500k-to-2m',
      step2: 'shoot',
      step3: 'swim',
      step4: 'exit',
    },
  },
  {
    id: 'e3',
    code: 'E3',
    name: 'Good Ending B',
    tierLabel: 'Good B',
    tier: 'good',
    route: 'route-b',
    recipeTags: [
      'Route B',
      'Clean Profile',
      'Wait 15–60s (Take Deal)',
      '$500K+ Bonus',
    ],
    unlockSteps: [
      'Reach a Low / Break Up Relationship state by the finale (Route B).',
      'Maintain a Clean (Professional) Criminal Profile (Chaos disqualifies this ending).',
      'During Protective Custody, wait 15–60 seconds without shooting to trigger "Take Deal".',
      'Optional: Hold $500,000+ in BuckMe! Family Savings for the extended prison visit epilogue.',
    ],
    bonusEpilogueNote: E3_BONUS_EPILOGUE_NOTE,
    spoilerSummary:
      'Accepting the deal with a Clean profile leads to a government Tower sting where Jason takes the fall to shield Lucia. Lucia walks free—and with $500K+ in Family Savings, a bonus epilogue shows her bringing Tomás to visit Jason in prison.',
    presetInput: {
      route: 'route-b',
      profile: 'clean',
      savings: '500k-to-2m',
      step2: 'take-deal',
    },
  },
  {
    id: 'e4',
    code: 'E4',
    name: 'Bad Ending A',
    tierLabel: 'Bad A',
    tier: 'bad',
    route: 'route-a',
    recipeTags: ['Route A', 'Shoot', 'Swim', 'Expire OR Chaos Profile'],
    unlockSteps: [
      'Maintain a Strong Relationship across Chapters 1–5 (Route A).',
      'During Protective Custody, choose "Shoot" and then choose "Swim" at the bridge.',
      'Converges via two paths: either carry a Violent / Psycho / Chaos profile (locks E4) OR carry a Clean profile and let the final "Expire" timer run out.',
    ],
    spoilerSummary:
      'Despite leaping from the bridge, either running out of time (Expire) or carrying a Chaos profile causes the water escape to collapse under heavy police fire, ending fatally on the shoreline.',
    presetInput: {
      route: 'route-a',
      profile: 'chaos',
      savings: 'under-500k',
      step2: 'shoot',
      step3: 'swim',
      step4: 'expire',
    },
  },
  {
    id: 'e5',
    code: 'E5',
    name: 'Bad Ending B',
    tierLabel: 'Bad B',
    tier: 'bad',
    route: 'route-a',
    recipeTags: ['Route A', 'Shoot', 'No Surrender'],
    unlockSteps: [
      'Maintain a Strong Relationship across Chapters 1–5 (Route A).',
      'During Protective Custody, choose "Shoot".',
      'At the bridge roadblock prompt, choose "No Surrender" regardless of Criminal Profile or BuckMe! savings.',
    ],
    spoilerSummary:
      'Refusing to bail out on the bridge, Jason and Lucia ram straight into the police roadblock together and are gunned down inside the car, leaving Tomás to be raised by Lucia’s relatives.',
    presetInput: {
      route: 'route-a',
      profile: 'clean',
      savings: 'under-500k',
      step2: 'shoot',
      step3: 'no-surrender',
    },
  },
  {
    id: 'e6',
    code: 'E6',
    name: 'Bad Ending C: Stay Down',
    tierLabel: 'Bad C: Stay Down',
    tier: 'bad',
    route: 'route-b',
    recipeTags: ['Route B', 'Shoot (or Chaos Deal)', 'Stay Down'],
    unlockSteps: [
      'Reach a Low / Break Up Relationship state by the finale (Route B).',
      'Trigger the Route B Final Standoff by choosing "Shoot" (or by waiting to "Take Deal" with a Chaos profile).',
      'During the rooftop standoff prompt, choose "Stay Down".',
    ],
    launchWeekNote: LAUNCH_WEEK_VERIFICATION_NOTE,
    spoilerSummary:
      'Cornered on the rooftop confrontation, Jason shoves Lucia down and takes the fatal volley. Choosing "Stay Down" lets Lucia survive under a witness-immunity bargain while living with Jason’s sacrifice.',
    presetInput: {
      route: 'route-b',
      profile: 'chaos',
      savings: 'under-500k',
      step2: 'shoot',
      step3: 'stay-down',
    },
  },
  {
    id: 'e7',
    code: 'E7',
    name: 'Bad Ending D: Defend',
    tierLabel: 'Bad D: Defend',
    tier: 'bad',
    route: 'route-b',
    recipeTags: ['Route B', 'Shoot (or Chaos Deal)', 'Defend'],
    unlockSteps: [
      'Reach a Low / Break Up Relationship state by the finale (Route B).',
      'Trigger the Route B Final Standoff by choosing "Shoot" (or by waiting to "Take Deal" with a Chaos profile).',
      'During the rooftop standoff prompt, choose "Defend".',
    ],
    launchWeekNote: LAUNCH_WEEK_VERIFICATION_NOTE,
    spoilerSummary:
      'When Jason shields Lucia during the rooftop ambush, choosing "Defend" makes Lucia stand up to fight back—resulting in both protagonists being killed together in the crossfire.',
    presetInput: {
      route: 'route-b',
      profile: 'chaos',
      savings: 'under-500k',
      step2: 'shoot',
      step3: 'defend',
    },
  },
  {
    id: 'e8',
    code: 'E8',
    name: 'Worst Ending: Hidden Deal',
    tierLabel: 'Worst: Hidden Deal',
    tier: 'worst',
    route: 'route-a',
    recipeTags: ['Route A', 'Wait 15–60s (Take Deal)', 'No Step 3'],
    unlockSteps: [
      'Maintain a Strong Relationship across Chapters 1–5 (Route A).',
      'During Protective Custody, ignore the "Shoot" prompt and wait 15–60 seconds to trigger the hidden "Take Deal" outcome.',
      'Resolves immediately with no bridge or escape prompts regardless of profile or savings.',
    ],
    spoilerSummary:
      'Waiting 15–60 seconds to accept Méndez’s offer on Route A bypasses the bridge finale entirely and triggers a ruthless double-cross in the Grass River Swamp, killing both Jason and Lucia.',
    presetInput: {
      route: 'route-a',
      profile: 'clean',
      savings: 'under-500k',
      step2: 'take-deal',
    },
  },
];

export const VALID_ENDING_IDS: ReadonlySet<string> = new Set(
  ENDINGS.map((ending) => ending.id)
);

export function getEndingById(id: EndingId): EndingDefinition {
  const found = ENDINGS.find((ending) => ending.id === id);
  if (!found) {
    throw new Error(`Unknown ending ID: ${id}`);
  }
  return found;
}

/**
 * Deterministically maps Step 1–4 choices to one of the 8 confirmed GTA 6 endings,
 * or reports the next constrained step needed when a path is incomplete.
 */
export function resolveEnding(inputs: EndingSimulationInput): EndingResolution {
  const { route, profile, savings, step2, step3, step4 } = inputs;

  if (route === 'route-a') {
    if (step2 === 'take-deal') {
      return {
        ending: getEndingById('e8'),
        isComplete: true,
        availableStep3Choices: [],
        requiresStep4: false,
      };
    }

    const availableStep3Choices: Step3Choice[] = ['swim', 'no-surrender'];

    if (step3 === 'no-surrender') {
      return {
        ending: getEndingById('e5'),
        isComplete: true,
        availableStep3Choices,
        requiresStep4: false,
      };
    }

    if (step3 === 'swim') {
      const chaosOverrideWarning =
        profile === 'chaos'
          ? 'Chaos profile locks Bad A (e4) on Swim even if you reach the Exit.'
          : undefined;

      if (step4 !== 'exit' && step4 !== 'expire') {
        return {
          ending: null,
          isComplete: false,
          nextRequiredStep: 'step4',
          availableStep3Choices,
          requiresStep4: true,
          warningNote: chaosOverrideWarning,
        };
      }

      if (step4 === 'expire' || profile === 'chaos') {
        return {
          ending: getEndingById('e4'),
          isComplete: true,
          availableStep3Choices,
          requiresStep4: true,
          warningNote:
            profile === 'chaos' && step4 === 'exit' ? chaosOverrideWarning : undefined,
        };
      }

      const ending =
        savings === '2m-plus' ? getEndingById('e1') : getEndingById('e2');
      return {
        ending,
        isComplete: true,
        availableStep3Choices,
        requiresStep4: true,
      };
    }

    return {
      ending: null,
      isComplete: false,
      nextRequiredStep: 'step3',
      availableStep3Choices,
      requiresStep4: false,
    };
  }

  // Route B
  if (step2 === 'take-deal' && profile === 'clean') {
    const hasBonusEpilogue = savings === '500k-to-2m' || savings === '2m-plus';
    return {
      ending: getEndingById('e3'),
      isComplete: true,
      availableStep3Choices: [],
      requiresStep4: false,
      bonusEpilogueNote: hasBonusEpilogue ? E3_BONUS_EPILOGUE_NOTE : undefined,
    };
  }

  const availableStep3Choices: Step3Choice[] = ['stay-down', 'defend'];
  const chaosDealWarning =
    step2 === 'take-deal' && profile === 'chaos'
      ? 'Chaos profile disqualifies Good B (e3) and forces the Route B standoff.'
      : undefined;

  if (step3 === 'stay-down') {
    const ending = getEndingById('e6');
    return {
      ending,
      isComplete: true,
      availableStep3Choices,
      requiresStep4: false,
      verificationNote: ending.launchWeekNote,
      warningNote: chaosDealWarning,
    };
  }

  if (step3 === 'defend') {
    const ending = getEndingById('e7');
    return {
      ending,
      isComplete: true,
      availableStep3Choices,
      requiresStep4: false,
      verificationNote: ending.launchWeekNote,
      warningNote: chaosDealWarning,
    };
  }

  return {
    ending: null,
    isComplete: false,
    nextRequiredStep: 'step3',
    availableStep3Choices,
    requiresStep4: false,
    warningNote: chaosDealWarning,
  };
}
