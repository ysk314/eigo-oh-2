import React from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ScoreResult } from '@/utils/score';
import styles from './ResultCard.module.css';

interface ResultCardProps {
    result: ScoreResult;
    stats: {
        correct: number;
        miss: number;
        timeLeft: number;
    };
    onRetry: () => void;
    onBack: () => void;
}

export function ResultCard({ result, stats, onRetry, onBack }: ResultCardProps) {
    const { rank, totalScore, accuracyScore, timeScore } = result;

    let message = 'Nice Try!';
    let rankColor = '#757575'; // C

    if (rank === 'S') {
        message = 'Perfect!!';
        rankColor = '#4CAF50'; // Green
    } else if (rank === 'A') {
        message = 'Great Job!';
        rankColor = '#2196F3'; // Blue
    } else if (rank === 'B') {
        message = 'Good!';
        rankColor = '#8BC34A'; // Light Green
    }

    const isUnlocked = rank === 'S';

    return (
        <Card className={styles.card} padding="lg">
            {/* TODO: Confetti effect here if S */}

            <h2 className={`${styles.message} ${rank === 'S' ? styles.rankS : ''}`}>
                {message}
            </h2>

            <div className={styles.rankContainer} style={{ color: rankColor }}>
                Rank {rank}
            </div>

            <div className={styles.scoreContainer}>
                Score: {totalScore}
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <div className={styles.statLabel}>正解数</div>
                    <div className={styles.statValue}>{stats.correct}</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statLabel}>ミス数</div>
                    <div className={styles.statValue} style={{ color: stats.miss > 0 ? 'var(--color-error)' : 'inherit' }}>
                        {stats.miss}
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statLabel}>残り時間</div>
                    <div className={styles.statValue}>{stats.timeLeft}s</div>
                </div>
            </div>

            {/* Score Breakdown (Optional, similar to legacy?) */}
            {/* Legacy didn't explicitly show breakdown in main view, but logically good to know */}
            <div className={styles.breakdown}>
                <small>Accuracy: {accuracyScore} + Time Bonus: {timeScore}</small>
            </div>

            {isUnlocked ? (
                <div className={styles.unlockMsg}>
                    ✨ Unlock Next Level! ✨
                </div>
            ) : (
                <div className={styles.failMsg}>
                    Sランク(100点以上)で次レベル解放！
                </div>
            )}

            <div className={styles.actions}>
                <Button onClick={onRetry} variant="secondary" size="lg">
                    もう一度
                </Button>
                <Button onClick={onBack} variant="primary" size="lg">
                    コースへ戻る
                </Button>
            </div>
        </Card>
    );
}
