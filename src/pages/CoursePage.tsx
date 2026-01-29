// ================================
// Course Page
// ================================

import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { UnitList } from '@/components/UnitList';
import { PartList } from '@/components/PageList';
import { SectionCard } from '@/components/SectionCard';
import { courseStructure, getSectionsByPart } from '@/data/questions';
import { LearningMode } from '@/types';
import styles from './CoursePage.module.css';

export function CoursePage() {
    const navigate = useNavigate();
    const { state, setUnit, setPart, setSection, setMode } = useApp();

    const units = courseStructure.units;
    const selectedUnitId = state.selectedUnit || units[0]?.id;
    const selectedUnit = useMemo(() =>
        units.find(u => u.id === selectedUnitId),
        [units, selectedUnitId]
    );

    const parts = selectedUnit?.parts || [];
    const selectedPartId = state.selectedPart || parts[0]?.id;
    const sections = useMemo(() =>
        getSectionsByPart(selectedPartId || ''),
        [selectedPartId]
    );

    // デフォルトのPartをStateに反映（PlayPageでの参照用）
    useEffect(() => {
        if (!state.selectedPart && parts.length > 0) {
            setPart(parts[0].id);
        }
    }, [state.selectedPart, parts, setPart]);

    const handleUnitSelect = (unitId: string) => {
        setUnit(unitId);
        // Unit変更時は最初のPartを自動選択
        const unit = units.find(u => u.id === unitId);
        if (unit?.parts[0]) {
            setPart(unit.parts[0].id);
        }
    };

    const handlePartSelect = (partId: string) => {
        setPart(partId);
    };

    const handleModeSelect = (sectionId: string, mode: LearningMode) => {
        // sectionId から section.type を取得して設定する
        const targetSection = sections.find(s => s.id === sectionId);

        if (targetSection) {
            setSection(targetSection.id);
            setMode(mode);
            navigate('/play');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const getCompletedCount = (_partId: string) => {
        // TODO: 進捗から完了数を計算
        return 0;
    };

    return (
        <div className={styles.page}>
            <Header
                breadcrumb={[courseStructure.name, selectedUnit?.name || '']}
                showShuffleToggle
                showBackButton
                onBack={handleBack}
            />

            <div className={styles.content}>
                {/* 左サイドバー: Unit + Part 一覧（2段構成） */}
                <aside className={styles.sidebar}>
                    <UnitList
                        units={units}
                        selectedUnitId={selectedUnitId}
                        onUnitSelect={handleUnitSelect}
                    />
                    <PartList
                        parts={parts}
                        selectedPartId={selectedPartId}
                        onPartSelect={handlePartSelect}
                        getCompletedCount={getCompletedCount}
                    />
                </aside>

                {/* メインエリア: セクションカード */}
                <main className={styles.main}>
                    {/* モード説明ヘッダー */}
                    <div className={styles.modeHeader}>
                        <div className={styles.modeLabel} data-mode="1">
                            <span className={styles.modeIcon}>🔊</span>
                            <span>音あり<br />スペルあり</span>
                        </div>
                        <div className={styles.modeLabel} data-mode="2">
                            <span className={styles.modeIcon}>🔊</span>
                            <span>音あり<br />スペルなし</span>
                        </div>
                        <div className={styles.modeLabel} data-mode="3">
                            <span className={styles.modeIcon}>🔇</span>
                            <span>音なし<br />スペルなし</span>
                        </div>
                    </div>

                    {/* セクションリスト */}
                    <div className={styles.sections}>
                        {sections.length > 0 ? (
                            sections.map((section) => (
                                <SectionCard
                                    key={section.id}
                                    section={section}
                                    completedCount={0}
                                    onModeSelect={handleModeSelect}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>このパートにはまだ問題がありません</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CoursePage;
