import {describe, expect, test, vi} from 'vitest'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import api from '../services/api.ts'
import Profile from './Profile.tsx'
import {loginAs, mockGet, renderPage} from '../../tests/utils.tsx'

const user = {id: 1, email: 'test@test.com', firstName: 'John', lastName: 'Doe', admin: false, createdAt: '2026-01-15T12:00:00.000Z', updatedAt: ''}

describe('Profile', () => {
    test("affiche les infos de l'utilisateur", async () => {
        loginAs(false)
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/user/1': user}))
        renderPage(<Profile/>)
        expect(await screen.findByText('John')).toBeInTheDocument()
        expect(screen.getByText('Doe')).toBeInTheDocument()
        expect(screen.getByText('test@test.com')).toBeInTheDocument()
        expect(screen.getByText('User')).toBeInTheDocument()
        expect(screen.getByText('January 15, 2026')).toBeInTheDocument()
    })

    test('promotion admin en dev', async () => {
        loginAs(false)
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/user/1': user}))
        vi.spyOn(api, 'post').mockResolvedValue({data: {...user, admin: true}})
        renderPage(<Profile/>)
        fireEvent.click(await screen.findByText('Promote to Admin (Dev)'))
        expect(await screen.findByText('Administrator')).toBeInTheDocument()
    })

    test('supprime le compte après confirmation', async () => {
        loginAs(false)
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/user/1': user}))
        const del = vi.spyOn(api, 'delete').mockResolvedValue({})
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage(<Profile/>)
        fireEvent.click(await screen.findByText('Delete Account'))
        await waitFor(() => expect(del).toHaveBeenCalledWith('/user/1'))
        expect(localStorage.getItem('token')).toBeNull()
    })

    test('affiche une erreur si le chargement échoue', async () => {
        loginAs(false)
        vi.spyOn(api, 'get').mockImplementation(mockGet({}))
        renderPage(<Profile/>)
        expect(await screen.findByText(/Failed to load profile/)).toBeInTheDocument()
    })
})
