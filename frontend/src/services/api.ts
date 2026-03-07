import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// Interceptor to add JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (params: URLSearchParams) => api.post('/auth/login', params),
    register: (data: any) => api.post('/auth/register/', data),
    getUsers: (companyId?: number) => api.get('/auth/users/', { params: { company_id: companyId } }),
    getMe: () => api.get('/auth/me/'),
    toggleUserStatus: (userId: number) => api.patch(`/auth/users/${userId}/status/`),
    updateProfile: (data: { name?: string; role?: string; company_id?: number | null; company_name?: string | null; employee_id?: string | null }) => api.patch('/auth/me', data),
};

export const companyApi = {
    list: () => api.get('/companies/'),
    get: (id: number) => api.get(`/companies/${id}/`),
    create: (data: any) => api.post('/companies/', data),
    updateStatus: (id: number, status: string) => api.patch(`/companies/${id}/status/`, { status }),
};

export const projectApi = {
    list: () => api.get('/projects/'),
    get: (id: number) => api.get(`/projects/${id}/`),
    create: (data: any) => api.post('/projects/', data),
};

export const taskApi = {
    list: (projectId?: number) => api.get('/tasks/', { params: { project_id: projectId } }),
    create: (data: any) => api.post('/tasks/', data),
    updateStatus: (id: number, status: string) => api.patch(`/tasks/${id}/`, { status }),
    updateProgress: (id: number, progress: number) => api.patch(`/tasks/${id}/progress/`, { progress }),
};

export const collabApi = {
    createMilestone: (data: any) => api.post('/collaboration/milestones/', data),
    listMilestones: (projectId: number) => api.get(`/collaboration/milestones/${projectId}/`),
    logTime: (data: any) => api.post('/collaboration/time-logs/', data),
    listTimeLogs: (taskId: number) => api.get(`/collaboration/time-logs/${taskId}/`),
    addComment: (data: any) => api.post('/collaboration/comments/', data),
    listComments: (taskId: number) => api.get(`/collaboration/comments/${taskId}/`),
};

export const deliverableApi = {
    create: (data: any) => api.post('/deliverables/', data),
    list: (projectId: number) => api.get(`/deliverables/${projectId}/`),
    updateStatus: (id: number, status: string) => api.patch(`/deliverables/${id}/status/`, { status }),
};

// Response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
