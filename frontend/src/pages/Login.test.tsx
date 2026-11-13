import {describe, expect, test, vi} from 'vitest'
import {fireEvent, screen} from '@testing-library/react'
import {AxiosError} from 'axios'
import api from '../services/api.ts'
import Login from './Login.tsx'
import {renderPage} from '../../tests/utils.tsx'

const fill = (container: HTMLElement, email: string, password: string) => {
    fireEvent.change(container.querySelector('input[type=email]')!, {target: {value: email}})
    fireEvent.change(container.querySelector('input[type=password]')!, {target: {value: password}})
    fireEvent.click(screen.getByRole('button', {name: 'Login'}))
}

describe('Login', () => {
    test('connexion OK redirige vers les sessions', async () => {
        const post = vi.spyOn(api, 'post').mockResolvedValue({data: {token: 't', id: 1, admin: false}})
        const {container} = renderPage(<Login/>)
        fill(container, 'yoga@studio.com', 'test!1234')
        expect(await screen.findByText('redirected')).toBeInTheDocument()
        expect(post).toHaveBeenCalledWith('/auth/login', {email: 'yoga@studio.com', password: 'test!1234'})
        expect(localStorage.getItem('token')).toBe('t')
    })

    test('affiche une erreur avec de mauvais identifiants', async () => {
        vi.spyOn(api, 'post').mockRejectedValue(new AxiosError('Invalid credentials'))
        const {container} = renderPage(<Login/>)
        fill(container, 'yoga@studio.com', 'wrong')
        expect(await screen.findByText(/Erreur :.*Invalid credentials/)).toBeInTheDocument()
    })

    test("n'envoie rien si un champ est manquant", () => {
        const post = vi.spyOn(api, 'post')
        const {container} = renderPage(<Login/>)
        fill(container, 'yoga@studio.com', '')
        expect(post).not.toHaveBeenCalled()
    })
})
