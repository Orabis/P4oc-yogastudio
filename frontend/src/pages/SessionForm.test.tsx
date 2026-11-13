import {describe, expect, test, vi} from 'vitest'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {AxiosError} from 'axios'
import api from '../services/api.ts'
import SessionForm from './SessionForm.tsx'
import {loginAs, mockGet, renderPage, session, teacher} from '../../tests/utils.tsx'

const change = (container: HTMLElement, name: string, value: string) =>
    fireEvent.change(container.querySelector(`[name=${name}]`)!, {target: {value}})

const fillAndSubmit = (container: HTMLElement) => {
    change(container, 'name', 'Evening Yoga')
    change(container, 'date', '2026-05-01')
    change(container, 'teacherId', '1')
    change(container, 'description', 'Relax')
    fireEvent.click(screen.getByRole('button', {name: 'Create Session'}))
}

const renderCreate = () => {
    vi.spyOn(api, 'get').mockImplementation(mockGet({'/teacher': [teacher]}))
    return renderPage(<SessionForm/>, {route: '/sessions/create', path: '/sessions/create'})
}

describe('SessionForm', () => {
    test('création OK', async () => {
        loginAs(true)
        const post = vi.spyOn(api, 'post').mockResolvedValue({})
        const {container} = renderCreate()
        await screen.findByText('Margot Delahaye')
        fillAndSubmit(container)
        expect(await screen.findByText('redirected')).toBeInTheDocument()
        expect(post).toHaveBeenCalledWith('/session', {name: 'Evening Yoga', date: '2026-05-01', teacherId: 1, description: 'Relax'})
    })

    test("n'envoie rien si un champ est manquant", async () => {
        loginAs(true)
        const post = vi.spyOn(api, 'post')
        const {container} = renderCreate()
        change(container, 'name', 'Evening Yoga')
        fireEvent.click(screen.getByRole('button', {name: 'Create Session'}))
        expect(post).not.toHaveBeenCalled()
    })

    test('modification OK avec le formulaire prérempli', async () => {
        loginAs(true)
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/teacher': [teacher], '/session/1': session}))
        const put = vi.spyOn(api, 'put').mockResolvedValue({})
        const {container} = renderPage(<SessionForm/>, {route: '/sessions/edit/1', path: '/sessions/edit/:id'})
        expect(await screen.findByDisplayValue('Morning Yoga')).toBeInTheDocument()
        change(container, 'name', 'Updated Yoga')
        fireEvent.click(screen.getByRole('button', {name: 'Update Session'}))
        await waitFor(() => expect(put).toHaveBeenCalledWith('/session/1', expect.objectContaining({name: 'Updated Yoga', teacherId: 1})))
    })

    test("affiche une erreur si l'enregistrement échoue", async () => {
        loginAs(true)
        vi.spyOn(api, 'post').mockRejectedValue(new AxiosError('fail'))
        const {container} = renderCreate()
        await screen.findByText('Margot Delahaye')
        fillAndSubmit(container)
        expect(await screen.findByText('Failed to save session')).toBeInTheDocument()
    })

    test('redirige un utilisateur non admin', async () => {
        loginAs(false)
        renderCreate()
        expect(await screen.findByText('redirected')).toBeInTheDocument()
    })
})
