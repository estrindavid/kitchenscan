export interface FeedbackInput {
  anonymousId: string;
  rating: number;
  wouldUseAgain: boolean;
  mostUseful?: string;
  friction?: string;
}

export interface FeedbackRecord extends FeedbackInput {
  id: string;
  receivedAt: string;
}

export interface FeedbackSummary {
  totalFeedback: number;
  uniqueTesters: number;
  averageRating: number;
  wouldUseAgainCount: number;
  wouldUseAgainRate: number;
  recent: FeedbackRecord[];
}

export function createFeedbackStore() {
  const records: FeedbackRecord[] = [];

  return {
    record(input: FeedbackInput): FeedbackRecord {
      const record: FeedbackRecord = {
        ...input,
        id: `feedback-${records.length + 1}`,
        receivedAt: new Date().toISOString(),
      };
      records.push(record);
      return record;
    },

    summary(): FeedbackSummary {
      const totalFeedback = records.length;
      const uniqueTesters = new Set(records.map((record) => record.anonymousId)).size;
      const ratingTotal = records.reduce((sum, record) => sum + record.rating, 0);
      const wouldUseAgainCount = records.filter((record) => record.wouldUseAgain).length;

      return {
        totalFeedback,
        uniqueTesters,
        averageRating: totalFeedback === 0 ? 0 : Math.round((ratingTotal / totalFeedback) * 10) / 10,
        wouldUseAgainCount,
        wouldUseAgainRate: totalFeedback === 0 ? 0 : Math.round((wouldUseAgainCount / totalFeedback) * 100),
        recent: [...records].reverse().slice(0, 5),
      };
    },

    reset() {
      records.length = 0;
    },
  };
}

export const feedbackStore = createFeedbackStore();
