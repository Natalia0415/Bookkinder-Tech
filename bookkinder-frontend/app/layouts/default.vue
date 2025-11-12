<script setup>
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router';

const auth = useAuth();
const router = useRouter();

const handleLogout = async () => {
    await auth.logout();
    router.push('/');
};
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <NuxtLink to="/" class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span class="text-white font-bold text-lg">B</span>
                            </div>
                            <span class="text-xl font-bold text-gray-900">bookkinder</span>
                        </NuxtLink>
                    </div>

                    <!-- Navigation -->
                    <nav class="hidden md:flex space-x-8">
                        <NuxtLink
                            v-if="auth.isAuthenticated.value"
                            to="/dashboard" 
                            class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            active-class="text-blue-600 bg-blue-50"
                        >
                            Resumen
                        </NuxtLink>
                        <NuxtLink 
                            v-if="auth.isAuthenticated.value"
                            to="/" 
                            class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            active-class="text-blue-600 bg-blue-50"
                        >
                            Libros
                        </NuxtLink>
                        <ClientOnly>
                            <template v-if="auth.isAuthenticated.value">
                                <NuxtLink 
                                    to="/users" 
                                    class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    active-class="text-blue-600 bg-blue-50"
                                >
                                    Usuarios
                                </NuxtLink>
                            </template>
                        </ClientOnly>
                    </nav>

                    <!-- User Menu -->
                    <div class="flex items-center space-x-4">
                        <ClientOnly>
                            <template v-if="auth.isAuthenticated.value">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span class="text-blue-600 font-medium text-sm">
                                            {{ auth.user.value?.name?.charAt(0) || 'U' }}
                                        </span>
                                    </div>
                                    <span class="text-sm text-gray-700 hidden sm:block">
                                        {{ auth.user.value?.name || 'Usuario' }}
                                    </span>
                                </div>
                                <button 
                                    class="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    @click="handleLogout" 
                                >
                                    Cerrar Sesión
                                </button>
                            </template>
                            <template v-else>
                                <NuxtLink 
                                    to="/login" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Iniciar Sesión
                                </NuxtLink>
                            </template>
                            <template #fallback>
                                <div class="w-20 h-8 bg-gray-200 rounded animate-pulse" />
                            </template>
                        </ClientOnly>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <slot />
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t mt-12">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div class="text-center text-gray-500 text-sm">
                    © {{ new Date().getFullYear() }} bookkinder. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    </div>
</template>
