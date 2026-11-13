import {describe, expect, test} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import Navbar from "./Navbar.tsx";
import {loginAs} from "../../tests/utils.tsx";

const renderNavbar = () => render(<MemoryRouter><Navbar/></MemoryRouter>)

describe('Navbar', () => {
    test('affiche Login et Register pour un visiteur', () => {
        renderNavbar()
        expect(screen.getByText('Login')).toBeInTheDocument()
        expect(screen.getByText('Register')).toBeInTheDocument()
    })

    test('affiche Create Session seulement pour un admin', () => {
        loginAs(true)
        renderNavbar()
        expect(screen.getByText('Create Session')).toBeInTheDocument()
    })

    test('le logout vide la session', () => {
        loginAs(false)
        renderNavbar()
        expect(screen.queryByText('Create Session')).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('Logout'))
        expect(localStorage.getItem('token')).toBeNull()
    })
})
