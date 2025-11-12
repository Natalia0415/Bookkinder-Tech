<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserService, type User } from '~/services/UserService'
import UserModal from '~/components/UserModal.vue'

import { useAuth } from '~/composables/useAuth'

definePageMeta({
    middleware: ['auth'],
})

const store = useAuth()
const userService = new UserService()
const users = ref<User[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filteredUsers = ref<User[]>([])

// Modal state
const showUserModal = ref(false)
const editingUser = ref<User | null>(null)

onMounted(async () => {
    try {
        users.value = await userService.getUsers() 
        filteredUsers.value = users.value
    } catch (error) {
        console.error('Error loading users:', error)
    } finally {
        loading.value = false
    }
})

const handleSearch = async () => {
    if (searchQuery.value.trim()) {
        try {
            filteredUsers.value = await userService.searchUsers(searchQuery.value)
        } catch (error) {
            console.error('Error searching users:', error)
        }
    } else {
        filteredUsers.value = users.value
    }
}

const getRoleBadgeClass = (role: string) => {
    return role === 'admin' 
        ? 'bg-red-100 text-red-800' 
        : 'bg-green-100 text-green-800'
}

const getRoleText = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Usuario'
}

// Modal functions
const openCreateModal = () => {
    editingUser.value = null
    showUserModal.value = true
}

const openEditModal = (user: User) => {
    editingUser.value = user
    showUserModal.value = true
}

const closeModal = () => {
    showUserModal.value = false
    editingUser.value = null
}

const handleUserSaved = async (savedUser: User) => {
    // Refresh the users list
    try {
        users.value = await userService.getUsers()
        if (searchQuery.value.trim()) {
            filteredUsers.value = await userService.searchUsers(searchQuery.value)
        } else {
            filteredUsers.value = users.value
        }
    } catch (error) {
        console.error('Error refreshing users:', error)
    }
}

const handleDeleteUser = async (user: User) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a "${user.name}"?`)) {
        try {

            await userService.deleteUser(user.id)

            users.value = users.value.filter(u => u.id !== user.id)
            filteredUsers.value = filteredUsers.value.filter(u => u.id !== user.id)
            
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error al eliminar el usuario')
        }
    }
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Usuarios</h1>
                <p class="text-gray-600 mt-1">Gestiona los usuarios del sistema</p>
            </div>
            <button 
                @click="openCreateModal"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Usuario
            </button>
        </div>

        <!-- Search and Stats -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div class="flex-1 max-w-md">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Buscar usuarios..."
                            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            @input="handleSearch"
                        />
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-sm text-gray-500">
                        Mostrando {{ filteredUsers.length }} de {{ users.length }} usuarios
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Grid -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
            <p class="mt-1 text-sm text-gray-500">Intenta con otros términos de búsqueda.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
                v-for="user in filteredUsers" 
                v-show="user.id != store.user?.value?.id"
                :key="user.id" 
                class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
                <div class="p-6">
                    <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                            <div v-if="user.avatar" class="w-12 h-12 rounded-full overflow-hidden">
                                <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover">
                            </div>
                            <div v-else class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span class="text-blue-600 font-medium text-lg">{{ user.name.charAt(0) }}</span>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg font-medium text-gray-900 truncate">{{ user.name }}</h3>
                            <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
                            <div class="mt-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                      :class="getRoleBadgeClass(user.role)">
                                    {{ getRoleText(user.role) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="flex items-center justify-between text-sm text-gray-500">
                            <span>Registrado el {{ new Date(user.createdAt).toLocaleDateString() }}</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex space-x-2">
                        <button 
                            @click="openEditModal(user)"
                            class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                        </button>
                        <button 
                            @click="handleDeleteUser(user)"
                            class="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- User Modal -->
        <UserModal
            :is-open="showUserModal"
            :user="editingUser"
            @close="closeModal"
            @saved="handleUserSaved"
        />
    </div>

</template>