import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { PrivateRoute } from './PrivateRoute';
import { AppLayout } from '../layouts/AppLayout';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SubjectsPage } from '../pages/SubjectsPage';
import { SubjectPage } from '../pages/SubjectPage';
import { ModulePage } from '../pages/ModulePage';
import { ConceptPage } from '../pages/ConceptPage';
import { QuizPage } from '../pages/QuizPage';
import { QuizResultPage } from '../pages/QuizResultPage';
import { ContentManagerPage } from '../pages/admin/ContentManagerPage';

export function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<AppLayout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/subjects" element={<SubjectsPage />} />
                            <Route path="/subjects/:subjectSlug" element={<SubjectPage />} />
                            <Route path="/modules/:moduleId" element={<ModulePage />} />
                            <Route path="/concepts/:conceptSlug" element={<ConceptPage />} />
                            <Route path="/concepts/:conceptSlug/quiz" element={<QuizPage />} />
                            <Route path="/concepts/:conceptSlug/quiz/result/:attemptId" element={<QuizResultPage />} />

                            {/* Admin Protected Routes */}
                            <Route path="/admin/content" element={<ContentManagerPage />} />
                        </Route>
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
