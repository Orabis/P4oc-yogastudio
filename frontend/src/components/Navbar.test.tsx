import {describe, expect, test} from 'vitest'
import {render, screen} from '@testing-library/react'
import Navbar from "./Navbar.tsx";

describe('Navbar', () => {
    test('should render the navbar', () => {
        render(<Navbar/>)
        expect(screen.getByText('My Name Is')).toBeInTheDocument()
    })
})
