import {ReactNode} from 'react'
import {render} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {AuthResponse} from '../src/types'

export const createClient = () =>
    new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}})

export const wrapper = ({children}: { children: ReactNode }) => (
    <QueryClientProvider client={createClient()}>
        <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
)

export const renderPage = (ui: ReactNode, {route = '/', path = '/'} = {}) =>
    render(
        <QueryClientProvider client={createClient()}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path={path} element={ui}/>
                    <Route path="*" element={<div>redirected</div>}/>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )

export const loginAs = (admin: boolean): AuthResponse => {
    const user = {id: 1, email: 'test@test.com', firstName: 'John', lastName: 'Doe', admin}
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify(user))
    return {...user, token: 'fake-token'}
}
