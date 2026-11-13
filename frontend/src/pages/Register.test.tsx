import {describe, expect, test, vi} from 'vitest'
import {fireEvent, screen} from '@testing-library/react'
import {AxiosError, AxiosResponse} from 'axios'
import api from '../services/api.ts'
import Register from './Register.tsx'
import {renderPage} from '../../tests/utils.tsx'

const fill = (container: HTMLElement, values: Record<string, string>) => {
    Object.entries(values).forEach(([name, value]) =>
        fireEvent.change(container.querySelector(`input[name=${name}]`)!, {target: {value}}))
    fireEvent.click(screen.getByRole('button', {name: 'Register'}))
}

const user = {firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com', password: 'password123'}

describe('Register', () => {
    test('création OK redirige vers les sessions', async () => {
        const post = vi.spyOn(api, 'post').mockResolvedValue({data: {token: 't', id: 2}})
        const {container} = renderPage(<Register/>)
        fill(container, user)
        expect(await screen.findByText('redirected')).toBeInTheDocument()
        expect(post).toHaveBeenCalledWith('/auth/register', user)
    })

    test("affiche le message d'erreur de l'API", async () => {
        const error = new AxiosError('fail')
        error.response = {data: {message: 'Email already used'}} as AxiosResponse
        vi.spyOn(api, 'post').mockRejectedValue(error)
        const {container} = renderPage(<Register/>)
        fill(container, user)
        expect(await screen.findByText('Email already used')).toBeInTheDocument()
    })

    test("n'envoie rien si un champ est manquant", () => {
        const post = vi.spyOn(api, 'post')
        const {container} = renderPage(<Register/>)
        fill(container, {...user, lastName: ''})
        expect(post).not.toHaveBeenCalled()
    })
})
