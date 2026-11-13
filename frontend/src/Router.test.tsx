import {describe, expect, test, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import api from './services/api.ts'
import App from './App.tsx'
import {loginAs, mockGet} from '../tests/utils.tsx'

describe('Router', () => {
    test('redirige vers le login sans authentification', async () => {
        window.history.pushState({}, '', '/sessions')
        render(<App/>)
        expect(await screen.findByText('Login to Yoga Studio')).toBeInTheDocument()
    })

    test('affiche les sessions une fois connecté', async () => {
        loginAs(false)
        vi.spyOn(api, 'get').mockImplementation(mockGet({'/session': []}))
        window.history.pushState({}, '', '/')
        render(<App/>)
        expect(await screen.findByText('Yoga Sessions')).toBeInTheDocument()
    })
})
