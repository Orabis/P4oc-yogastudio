import {describe, expect, test, vi} from 'vitest'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import api from '../services/api.ts'
import Sessions from './Sessions.tsx'
import {loginAs, mockGet, renderPage, session} from '../../tests/utils.tsx'

describe('Sessions', () => {
    test('affiche la liste sans boutons admin pour un utilisateur', async () => {
        loginAs(false)
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/session': [session]}))
        renderPage(<Sessions/>)
        expect(await screen.findByText('Morning Yoga')).toBeInTheDocument()
        expect(screen.getByText('Teacher: Margot Delahaye')).toBeInTheDocument()
        expect(screen.getByText('View Details')).toBeInTheDocument()
        expect(screen.queryByText('Create Session')).not.toBeInTheDocument()
        expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    test("l'admin voit Create et peut supprimer une session", async () => {
        loginAs(true)
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/session': [session]}))
        const del = vi.spyOn(api, 'delete').mockResolvedValue({})
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage(<Sessions/>)
        fireEvent.click(await screen.findByText('Delete'))
        expect(screen.getByText('Create Session')).toBeInTheDocument()
        await waitFor(() => expect(del).toHaveBeenCalledWith('/session/1'))
    })

    test('affiche un message si aucune session', async () => {
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/session': []}))
        renderPage(<Sessions/>)
        expect(await screen.findByText('No sessions available')).toBeInTheDocument()
    })

    test('affiche une erreur si le chargement échoue', async () => {
        vi.spyOn(api, 'get').mockImplementation(mockGet({}))
        renderPage(<Sessions/>)
        expect(await screen.findByText('Failed to load sessions')).toBeInTheDocument()
    })
})
