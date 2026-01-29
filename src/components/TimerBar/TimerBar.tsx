import React from 'react';
import styles from './TimerBar.module.css';

interface TimerBarProps {
    total: number;
    current: number;
    showText?: boolean;
}

export function TimerBar({ total, current, showText = true }: TimerBarProps) {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));
    const isCritical = current <= 10 && current > 0; // Visual warning

    return (
        <div>
            <div className={styles.container}>
                <div
                    className={`${styles.bar} ${isCritical ? styles.critical : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showText && (
                <div className={styles.text}>
                    残り {current} / {total} 秒
                </div>
            )}
        </div>
    );
}

export default TimerBar;
