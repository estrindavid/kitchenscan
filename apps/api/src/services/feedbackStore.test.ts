import { describe, expect, it } from 'vitest';
import { createFeedbackStore } from './feedbackStore';

describe('feedback store', () => {
  it('records anonymous tester feedback and summarizes validation stats', () => {
    const store = createFeedbackStore();

    store.record({
      anonymousId: 'tester-a',
      rating: 5,
      wouldUseAgain: true,
      mostUseful: 'Recipe ideas from scanned ingredients',
    });
    store.record({
      anonymousId: 'tester-b',
      rating: 4,
      wouldUseAgain: true,
      mostUseful: 'Food waste',
    });
    store.record({
      anonymousId: 'tester-a',
      rating: 3,
      wouldUseAgain: false,
    });

    expect(store.summary()).toEqual({
      totalFeedback: 3,
      uniqueTesters: 2,
      averageRating: 4,
      wouldUseAgainCount: 2,
      wouldUseAgainRate: 67,
      recent: [
        expect.objectContaining({ anonymousId: 'tester-a', rating: 3 }),
        expect.objectContaining({ anonymousId: 'tester-b', rating: 4 }),
        expect.objectContaining({ anonymousId: 'tester-a', rating: 5 }),
      ],
    });
  });
});
