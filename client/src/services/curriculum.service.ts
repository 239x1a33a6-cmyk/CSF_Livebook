import api from './api';

export const subjectsService = {
    async getAll() {
        const { data } = await api.get('/subjects');
        return data.data;
    },
    async getBySlug(slug: string) {
        const { data } = await api.get(`/subjects/${slug}`);
        return data.data;
    },
    async getModules(subjectId: string) {
        const { data } = await api.get(`/subjects/${subjectId}/modules`);
        return data.data;
    },
};

export const modulesService = {
    async getById(moduleId: string) {
        const { data } = await api.get(`/modules/${moduleId}`);
        return data.data;
    },
    async getConcepts(moduleId: string) {
        const { data } = await api.get(`/modules/${moduleId}/concepts`);
        return data.data;
    },
};

export const conceptsService = {
    async getBySlug(slug: string) {
        const { data } = await api.get(`/concepts/slug/${slug}`);
        return data.data;
    },
    async getContent(conceptId: string) {
        const { data } = await api.get(`/concepts/${conceptId}/content`);
        return data.data;
    },
    async getResources(conceptId: string) {
        const { data } = await api.get(`/concepts/${conceptId}/resources`);
        return data.data;
    },
    async getQuiz(conceptId: string) {
        const { data } = await api.get(`/concepts/${conceptId}/quiz`);
        return data.data;
    },
    async start(conceptId: string) {
        const { data } = await api.post(`/concepts/${conceptId}/start`);
        return data.data;
    },
};

export const quizService = {
    async submitAttempt(assessmentId: string, answers: Array<{ questionId: string; response: unknown }>) {
        const { data } = await api.post(`/assessments/${assessmentId}/attempts`, { answers });
        return data.data;
    },
};

export const progressService = {
    async getDashboard() {
        const { data } = await api.get('/users/me/dashboard');
        return data.data;
    },
    async getAll() {
        const { data } = await api.get('/users/me/progress');
        return data.data;
    },
};
