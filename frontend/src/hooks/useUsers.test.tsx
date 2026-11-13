import {describe, expect, test, vi} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import api from '../services/api.ts'
import {useDeleteAccount, usePromoteAdmin} from './useUsers.ts'
import {useTeachers} from './useTeachers.ts'
import {loginAs, wrapper} from '../../tests/utils.tsx'
import {authService} from '../services/auth.service.ts'

describe('useUsers', () => {
    test('usePromoteAdmin met à jour le user courant', async () => {
        loginAs(false)
        vi.spyOn(api, 'post').mockResolvedValue({data: {id: 1, admin: true}})
        const {result} = renderHook(() => usePromoteAdmin(), {wrapper})
        result.current.mutate()
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(authService.getCurrentUser()?.admin).toBe(true)
    })

    test('useDeleteAccount déconnecte après suppression', async () => {
        loginAs(false)
        vi.spyOn(api, 'delete').mockResolvedValue({})
        const {result} = renderHook(() => useDeleteAccount(), {wrapper})
        result.current.mutate(1)
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(api.delete).toHaveBeenCalledWith('/user/1')
        expect(localStorage.getItem('token')).toBeNull()
    })

    test('useDeleteAccount affiche une alerte en cas d’erreur', async () => {
        vi.spyOn(api, 'delete').mockRejectedValue(new Error())
        const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
        const {result} = renderHook(() => useDeleteAccount(), {wrapper})
        result.current.mutate(1)
        await waitFor(() => expect(alert).toHaveBeenCalledWith('Failed to delete account'))
    })
})

describe('useTeachers', () => {
    test('récupère la liste des profs', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({data: [{id: 1}]})
        const {result} = renderHook(() => useTeachers(), {wrapper})
        await waitFor(() => expect(result.current.data).toEqual([{id: 1}]))
        expect(api.get).toHaveBeenCalledWith('/teacher')
    })
})
