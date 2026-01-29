// ================================
// Unit List Component
// ================================

import { Unit } from '@/types';
import styles from './UnitList.module.css';

interface UnitListProps {
    units: Unit[];
    selectedUnitId: string | null;
    onUnitSelect: (unitId: string) => void;
}

export function UnitList({
    units,
    selectedUnitId,
    onUnitSelect,
}: UnitListProps) {
    return (
        <nav className={styles.list} aria-label="ユニット一覧">
            {units.map((unit) => {
                const isSelected = unit.id === selectedUnitId;

                return (
                    <button
                        key={unit.id}
                        className={`${styles.item} ${isSelected ? styles.selected : ''}`}
                        onClick={() => onUnitSelect(unit.id)}
                        aria-current={isSelected ? 'page' : undefined}
                    >
                        <span className={styles.name}>{unit.name}</span>
                    </button>
                );
            })}
        </nav>
    );
}

export default UnitList;
