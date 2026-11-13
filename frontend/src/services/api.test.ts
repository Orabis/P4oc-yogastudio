import {describe, expect, test} from 'vitest'
import {InternalAxiosRequestConfig, AxiosHeaders} from 'axios'
import api from './api.ts'

const runInterceptor = (config: InternalAxiosRequestConfig) =>
    // @ts-expect-error handlers is internal to axios
    api.interceptors.request.handlers[0].fulfilled(config) as InternalAxiosRequestConfig

describe('api', () => {
    test('ajoute le token dans le header Authorization', () => {
        localStorage.setItem('token', 'abc')
        const config = runInterceptor({headers: new AxiosHeaders()})
        expect(config.headers.Authorization).toBe('Bearer abc')
    })

    test("n'ajoute rien sans token", () => {
        const config = runInterceptor({headers: new AxiosHeaders()})
        expect(config.headers.Authorization).toBeUndefined()
    })
})
