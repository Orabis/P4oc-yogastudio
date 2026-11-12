import {afterEach, beforeEach, vi} from 'vitest'
import {cleanup} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import storageMock from './storage.mock'

beforeEach(() => {
    vi.stubGlobal('localStorage', storageMock())
})

afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})
