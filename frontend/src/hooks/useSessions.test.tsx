import {describe, expect, test, vi} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import api from '../services/api.ts'
import {useDeleteSession, useParticipate, useSaveSession, useSession, useSessions, useUnparticipate} from './useSessions.ts'
import {wrapper} from '../../tests/utils.tsx'

const form = {name: 'Yoga', date: '2026-01-01', description: 'desc', teacherId: 1}

describe('useSessions', () => {
    test('useSessions et useSession récupèrent les données', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({data: [{id: 1}]})
        const list = renderHook(() => useSessions(), {wrapper})
        const one = renderHook(() => useSession('1'), {wrapper})
        await waitFor(() => expect(list.result.current.data).toEqual([{id: 1}]))
        await waitFor(() => expect(one.result.current.isSuccess).toBe(true))
        expect(api.get).toHaveBeenCalledWith('/session/1')
    })

    test("useSession ne fetch pas sans id", () => {
        const get = vi.spyOn(api, 'get')
        renderHook(() => useSession(), {wrapper})
        expect(get).not.toHaveBeenCalled()
    })

    test('useSaveSession fait un POST en création et un PUT en édition', async () => {
        const post = vi.spyOn(api, 'post').mockResolvedValue({})
        const put = vi.spyOn(api, 'put').mockResolvedValue({})
        const create = renderHook(() => useSaveSession(), {wrapper})
        const edit = renderHook(() => useSaveSession('3'), {wrapper})
        create.result.current.mutate(form)
        edit.result.current.mutate(form)
        await waitFor(() => expect(edit.result.current.isSuccess).toBe(true))
        expect(post).toHaveBeenCalledWith('/session', form)
        expect(put).toHaveBeenCalledWith('/session/3', form)
    })

    test.each([
        ['useDeleteSession', () => useDeleteSession(), 1, 'Failed to delete session'],
        ['useParticipate', () => useParticipate(), {sessionId: 1, userId: 2}, 'Failed to join session'],
        ['useUnparticipate', () => useUnparticipate(), {sessionId: 1, userId: 2}, 'Failed to leave session'],
    ] as [string, () => { mutate: (v: unknown) => void }, unknown, string][])('%s affiche une alerte en cas d’erreur', async (_, hook, arg, message) => {
        vi.spyOn(api, 'delete').mockRejectedValue(new Error())
        vi.spyOn(api, 'post').mockRejectedValue(new Error())
        const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
        const {result} = renderHook(hook, {wrapper})
        result.current.mutate(arg)
        await waitFor(() => expect(alert).toHaveBeenCalledWith(message))
    })

    test('useParticipate et useUnparticipate appellent la bonne route', async () => {
        const post = vi.spyOn(api, 'post').mockResolvedValue({})
        const del = vi.spyOn(api, 'delete').mockResolvedValue({})
        const join = renderHook(() => useParticipate(), {wrapper})
        const leave = renderHook(() => useUnparticipate(), {wrapper})
        join.result.current.mutate({sessionId: 1, userId: 2})
        leave.result.current.mutate({sessionId: 1, userId: 2})
        await waitFor(() => expect(leave.result.current.isSuccess).toBe(true))
        expect(post).toHaveBeenCalledWith('/session/1/participate/2')
        expect(del).toHaveBeenCalledWith('/session/1/participate/2')
    })
})
