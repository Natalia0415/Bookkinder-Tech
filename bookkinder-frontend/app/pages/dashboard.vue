<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookService, type Book } from '~/services/BookService'
import { UserService, type User } from '~/services/UserService'

definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

const bookService = new BookService()
const userService = new UserService()

const stats = ref({
    totalBooks: 0,
    totalUsers: 0,
    topRatedBooks: [] as Book[],
    recentUsers: [] as User[]
})

const loading = ref(true)

onMounted(async () => {
    try {
        const [books, users, topBooks, recentUsers] = await Promise.all([
            bookService.getBooks(),
            userService.getUsers(),
            bookService.getTopRatedBooks(5),
            userService.getUsers()
        ])
        
        stats.value = {
            totalBooks: books.length,
            totalUsers: users.length,
            topRatedBooks: topBooks,
            recentUsers: recentUsers.slice(0, 5)
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <h1 class="text-3xl font-bold mb-2">¡Bienvenido a bookkinder!</h1>
            <p class="text-blue-100">Gestiona tu biblioteca digital de manera eficiente</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Total Libros</p>
                        <p class="text-2xl font-bold text-gray-900">{{ stats.totalBooks }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Total Usuarios</p>
                        <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Libros Destacados</p>
                        <p class="text-2xl font-bold text-gray-900">{{ stats.topRatedBooks.length }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">Crecimiento</p>
                        <p class="text-2xl font-bold text-gray-900">+12%</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Top Rated Books -->
            <div class="bg-white rounded-lg shadow-md">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Libros Mejor Valorados</h3>
                    <p class="text-sm text-gray-500">Los libros con mejor calificación</p>
                </div>
                <div class="p-6">
                    <div v-if="loading" class="space-y-4">
                        <div v-for="i in 3" :key="i" class="animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div class="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                        </div>
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="book in stats.topRatedBooks" :key="book.id" class="flex items-center space-x-4">
                            <div class="w-12 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-900">{{ book.title }}</h4>
                                <p class="text-sm text-gray-500">{{ book.author }}</p>
                                <div class="flex items-center mt-1">
                                    <div class="flex text-yellow-400">
                                        <span v-for="i in 5" :key="i" class="text-xs">★</span>
                                    </div>
                                    <span class="ml-2 text-sm text-gray-500">{{ book.rating }}/5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Users -->
            <div class="bg-white rounded-lg shadow-md">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Usuarios Recientes</h3>
                    <p class="text-sm text-gray-500">Últimos usuarios registrados</p>
                </div>
                <div class="p-6">
                    <div v-if="loading" class="space-y-4">
                        <div v-for="i in 4" :key="i" class="animate-pulse flex items-center space-x-4">
                            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div class="flex-1">
                                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div class="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="user in stats.recentUsers" :key="user.id" class="flex items-center space-x-4">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span class="text-blue-600 font-medium text-sm">{{ user.name.charAt(0) }}</span>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-900">{{ user.name }}</h4>
                                <p class="text-sm text-gray-500">{{ user.email }}</p>
                                <span 
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :class="user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                                    {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NuxtLink to="/" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">Gestionar Libros</h4>
                        <p class="text-sm text-gray-500">Ver y administrar la biblioteca</p>
                    </div>
                </NuxtLink>

                <NuxtLink to="/users" class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">Gestionar Usuarios</h4>
                        <p class="text-sm text-gray-500">Administrar usuarios del sistema</p>
                    </div>
                </NuxtLink>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">Ver Reportes</h4>
                        <p class="text-sm text-gray-500">Estadísticas y análisis</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
