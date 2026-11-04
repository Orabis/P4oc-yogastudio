import {describe, expect, test} from 'vitest'
import {render, screen} from '@testing-library/react'
import InfoField from "./InfoField.tsx";

describe('InfoField', () => {
    test('should render the label and the value', () => {
        render(<InfoField labelName="My Name Is" labelValue="Unknown"/>)
        expect(screen.getByText('My Name Is')).toBeInTheDocument()
        expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
})
