import { useState, useEffect, useRef, useCallback } from 'react';

interface UseGameTimerProps {
    totalChars: number;
    onTimeUp?: () => void;
}

interface UseGameTimerReturn {
    timeLeft: number;
    timeLimit: number;
    isActive: boolean;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: (newTotalChars?: number) => void;
}

export const useGameTimer = ({ totalChars, onTimeUp }: UseGameTimerProps): UseGameTimerReturn => {
    const calculateLimit = (chars: number) => Math.floor(chars * 1.0 + 10);

    const [timeLimit, setTimeLimit] = useState(calculateLimit(totalChars));
    const [timeLeft, setTimeLeft] = useState(calculateLimit(totalChars));
    const [isActive, setIsActive] = useState(false);

    const timerRef = useRef<number | null>(null);

    // Update limit if totalChars changes (e.g. new questions loaded)
    useEffect(() => {
        const newLimit = calculateLimit(totalChars);
        setTimeLimit(newLimit);
        setTimeLeft(newLimit);
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [totalChars]);

    const startTimer = useCallback(() => {
        if (isActive) return;
        setIsActive(true);

        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setIsActive(false);
                    if (onTimeUp) onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [isActive, onTimeUp]);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsActive(false);
    }, []);

    const resetTimer = useCallback((newTotalChars?: number) => {
        stopTimer();
        const chars = newTotalChars !== undefined ? newTotalChars : totalChars;
        const limit = calculateLimit(chars);
        setTimeLimit(limit);
        setTimeLeft(limit);
    }, [stopTimer, totalChars]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        timeLeft,
        timeLimit,
        isActive,
        startTimer,
        stopTimer,
        resetTimer
    };
};
