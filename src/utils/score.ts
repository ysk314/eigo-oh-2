import { Rank } from '../types';

export interface ScoreResult {
    accuracyScore: number;
    timeScore: number;
    totalScore: number;
    rank: Rank;
}

/**
 * Calculate the score and rank based on legacy logic.
 * 
 * Logic:
 * - Accuracy Score: 100 - (Miss * 5) (Max 100, Min 0)
 * - Time Score: (Remaining / Limit) * 50 (Only if No Miss) (Max 50)
 * - Total Score: Accuracy + Time
 * 
 * Rank:
 * - S: >= 100 (Essentially requires 0 Miss + Time Bonus)
 * - A: >= 80
 * - B: >= 60
 * - C: < 60 or Time Up
 * 
 * @param missCount Total miss count
 * @param timeLeft Remaining time in seconds
 * @param timeLimit Total time limit in seconds
 * @param timeUp Whether time is up
 */
export const calculateScore = (
    missCount: number,
    timeLeft: number,
    timeLimit: number,
    timeUp: boolean
): ScoreResult => {
    // 1. Accuracy Score: Deduct 5 points per miss from 100. Min 0.
    const accuracyScore = Math.max(0, 100 - (missCount * 5));

    // 2. Time Score: (Remaining / Limit) * 50. If timeUp, 0. Only add speed bonus if no miss.
    // Legacy logic: "timeUp || res.miss > 0" -> 0
    const timeScore = (timeUp || missCount > 0) ? 0 : Math.floor((timeLeft / timeLimit) * 50);

    // 3. Total
    const totalScore = accuracyScore + timeScore;

    // 4. Rank
    let rank: Rank = 'C';
    if (totalScore >= 100 && !timeUp) {
        rank = 'S';
    } else if (totalScore >= 80 && !timeUp) {
        rank = 'A';
    } else if (totalScore >= 60 && !timeUp) {
        rank = 'B';
    } else {
        rank = 'C';
    }

    return {
        accuracyScore,
        timeScore,
        totalScore,
        rank
    };
};
