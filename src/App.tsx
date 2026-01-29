import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { HomePage, CoursePage, PlayPage } from '@/pages';
import '@/styles/global.css';

function App() {
    return (
        <AppProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/course" element={<CoursePage />} />
                    <Route path="/play" element={<PlayPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </AppProvider>
    );
}

export default App;
