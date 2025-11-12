import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const user = ref<Record<string, any> | null>(null)
    const token = ref<string | null>(null)

    const setUser = (newUser: Record<string, any>) => {
        user.value = newUser
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(newUser))
        }
    }

    const setToken = (newToken: string) => {
        token.value = newToken
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', newToken)
        }
    }

    const initFromLocal = () => {
        try {
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('user')
                const storedToken = localStorage.getItem('token')

                if (storedUser) user.value = JSON.parse(storedUser)
                if (storedToken) token.value = storedToken
            }
        } catch (error) {
            console.error('Error initializing from localStorage:', error)
        }
    }

    const clearAuth = () => {
        user.value = null
        token.value = null
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
    }

    const isAuthenticated = computed(() => token.value ? true : false)
    const userFullName = computed(() => (user.value ? user.value.name : ''))

    return {
        user,
        token,
        setUser,
        setToken,
        initFromLocal,
        clearAuth,
        isAuthenticated,
        userFullName,
    }
})
