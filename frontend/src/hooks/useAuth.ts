import { useMutation } from '@tanstack/react-query';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import { authService } from '../services/auth.service';


export function useLogin() {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: authService.login,
        onSuccess: () => navigate('/sessions'),
    });

}

export function useRegister() {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: authService.register,
        onSuccess: () => navigate('/sessions'),
    })
}