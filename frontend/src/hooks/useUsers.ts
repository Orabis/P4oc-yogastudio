import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import api from "../services/api.ts";
import {authService} from "../services/auth.service.ts";
import {User} from "../types";

const fetchUserInfo = async (userId: number) => (await api.get<User>(`/user/${userId}`)).data;

const promoteAdmin = async () => (await api.post<User>('/user/promote-admin')).data;

export function useFetchUserInfo(userId?: number) {
    return useQuery({
        queryKey: ["users", userId],
        queryFn: () => fetchUserInfo(userId!),
        staleTime: 1000 * 60 * 2,
        enabled: userId !== undefined,
    })
}

export function usePromoteAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: promoteAdmin,
        onSuccess: (user) => {
            queryClient.setQueryData(["users", user.id], user);
            authService.updateCurrentUser({ admin: user.admin });
        },
    })
}

export function useDeleteAccount() {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: (userId: number) => api.delete(`/user/${userId}`),
        onSuccess: () => {
            authService.logout();
            navigate('/login');
        },
        onError: () => alert('Failed to delete account'),
    })
}
