import {describe, expect, test, vi} from 'vitest'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import api from '../services/api.ts'
import SessionDetail from './SessionDetail.tsx'
import {loginAs, mockGet, renderPage, session} from '../../tests/utils.tsx'

const renderDetail = (data = session) => {
    vi.spyOn(api, 'get').mockImplementation(mockGet({'/session/1': data}))
    return renderPage(<SessionDetail/>, {route: '/sessions/1', path: '/sessions/:id'})
}

describe('SessionDetail', () => {
    test('affiche les infos et Join pour un utilisateur', async () => {
        loginAs(false)
        const post = vi.spyOn(api, 'post').mockResolvedValue({})
        renderDetail()
        expect(await screen.findByText('Morning Yoga')).toBeInTheDocument()
        expect(screen.getByText('Une séance douce')).toBeInTheDocument()
        expect(screen.getByText(/Margot/)).toBeInTheDocument()
        expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('Join Session'))
        await waitFor(() => expect(post).toHaveBeenCalledWith('/session/1/participate/1'))
    })

    test('un participant peut quitter la session', async () => {
        loginAs(false)
        const del = vi.spyOn(api, 'delete').mockResolvedValue({})
        renderDetail({...session, users: [1]})
        fireEvent.click(await screen.findByText('Leave Session'))
        await waitFor(() => expect(del).toHaveBeenCalledWith('/session/1/participate/1'))
    })

    test("l'admin supprime la session et revient à la liste", async () => {
        loginAs(true)
        const del = vi.spyOn(api, 'delete').mockResolvedValue({})
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderDetail()
        expect(await screen.findByText('Edit')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Delete'))
        expect(await screen.findByText('redirected')).toBeInTheDocument()
        expect(del).toHaveBeenCalledWith('/session/1')
    })

    test('affiche une erreur si le chargement échoue', async () => {
        loginAs(false)
        vi.spyOn(api, 'get').mockImplementation(mockGet({}))
        renderPage(<SessionDetail/>, {route: '/sessions/1', path: '/sessions/:id'})
        expect(await screen.findByText('Failed to load session details')).toBeInTheDocument()
    })
})
