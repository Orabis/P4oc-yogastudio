import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import api from "../services/api.ts";
import {ParticipationParams, Session, SessionFormData} from "../types";

const fetchSessions = async () => (await api.get<Session[]>('/session')).data;

const fetchSession = async (sessionId: string) => (await api.get<Session>(`/session/${sessionId}`)).data;

const saveSession = (data: SessionFormData, sessionId?: string) =>
    sessionId ? api.put(`/session/${sessionId}`, data) : api.post('/session', data);

export function useSessions() {
    return useQuery({
        queryKey: ["sessions"],
        queryFn: fetchSessions,
    })
}

export function useSession(sessionId?: string) {
    return useQuery({
        queryKey: ["sessions", sessionId],
        queryFn: () => fetchSession(sessionId!),
        enabled: !!sessionId,
    })
}

export function useSaveSession(sessionId?: string) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SessionFormData) => saveSession(data, sessionId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["sessions"] });
            navigate('/sessions');
        },
    })
}

export function useDeleteSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: number) => api.delete(`/session/${sessionId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"], exact: true }),
        onError: () => alert('Failed to delete session'),
    })
}

export function useParticipate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sessionId, userId }: ParticipationParams) =>
            api.post(`/session/${sessionId}/participate/${userId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
        onError: () => alert('Failed to join session'),
    })
}

export function useUnparticipate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sessionId, userId }: ParticipationParams) =>
            api.delete(`/session/${sessionId}/participate/${userId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
        onError: () => alert('Failed to leave session'),
    })
}
