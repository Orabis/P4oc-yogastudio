import {useQuery} from "@tanstack/react-query";
import api from "../services/api.ts";
import {Teacher} from "../types";

const fetchTeachers = async () => (await api.get<Teacher[]>('/teacher')).data;

export function useTeachers() {
    return useQuery({
        queryKey: ["teachers"],
        queryFn: fetchTeachers,
    })
}
