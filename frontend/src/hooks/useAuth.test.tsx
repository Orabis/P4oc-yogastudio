import {describe, expect, test, vi} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import api from '../services/api.ts'
import {useLogin, useRegister} from './useAuth.ts'
import {wrapper} from '../../tests/utils.tsx'

describe('useAuth', () => {
    test.each([
        ['useLogin', useLogin, '/auth/login'],
        ['useRegister', useRegister, '/auth/register'],
    ])('%s appelle la bonne route et stocke le token', async (_, hook, url) => {
        const post = vi.spyOn(api, 'post').mockResolvedValue({data: {token: 't', id: 1}})
        const {result} = renderHook(() => hook(), {wrapper})
        result.current.mutate({email: 'a@a.com', password: 'p', firstName: 'a', lastName: 'b'})
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(post).toHaveBeenCalledWith(url, expect.objectContaining({email: 'a@a.com'}))
        expect(localStorage.getItem('token')).toBe('t')
    })
})
