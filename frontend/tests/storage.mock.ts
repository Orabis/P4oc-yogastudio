export default function storageMock (): Storage {
    const storage = {} as Record<string, string>
    return {
        setItem: function (key: string, value: string) {
            storage[key] = value || ''
        },
        getItem: function (key: string): string | null {
            return key in storage ? storage[key] : null
        },
        removeItem: function (key:string) {
            delete storage[key]
        },
        get length(): number {
            return Object.keys(storage).length
        },
        key: function (index: number): string | null {
            const keys = Object.keys(storage)
            return keys[index] || null
        },
        clear: function() {
            for (const key of Object.keys(storage)) {
                delete storage[key]
            }
        }
    }
}
