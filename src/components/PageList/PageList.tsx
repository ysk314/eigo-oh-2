// ================================
// Part List Component
// ================================

import React from 'react';
import { Part } from '@/types';
import styles from './PageList.module.css';

interface PartListProps {
    parts: Part[];
    selectedPartId: string | null;
    onPartSelect: (partId: string) => void;
    getCompletedCount?: (partId: string) => number;
}

export function PartList({
    parts,
    selectedPartId,
    onPartSelect,
    getCompletedCount = () => 0,
}: PartListProps) {
    return (
        <nav className={styles.list} aria-label="パート一覧">
            {parts.map((part) => {
                const completed = getCompletedCount(part.id);
                const isSelected = part.id === selectedPartId;
                const isEmpty = part.totalQuestions === 0;

                return (
                    <button
                        key={part.id}
                        className={`${styles.item} ${isSelected ? styles.selected : ''} ${isEmpty ? styles.empty : ''}`}
                        onClick={() => !isEmpty && onPartSelect(part.id)}
                        disabled={isEmpty}
                        aria-current={isSelected ? 'page' : undefined}
                    >
                        <span className={styles.range}>{part.range}</span>
                        <span className={styles.count}>
                            {isEmpty ? '-' : `${completed}/${part.totalQuestions}`}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

// 後方互換のため PageList もエクスポート
export const PageList = PartList;

export default PartList;
