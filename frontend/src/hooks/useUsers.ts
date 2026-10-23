import {useQuery} from "@tanstack/react-query";
import api from "../services/api.ts";
import {AuthResponse} from "../types";

async function fetchUserInfo(user: AuthResponse, token: string) {
    const response = await api.get(`/user/${user.id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data
}

export function useFetchUserInfo(user: AuthResponse | null, token: string | null) {
    return useQuery({
        queryKey: ["fetchusers", user?.id],
        queryFn: ()=> fetchUserInfo(user!, token!),
        staleTime: 1000 * 60 * 2,
        enabled: !!user || !!token,
    })
}