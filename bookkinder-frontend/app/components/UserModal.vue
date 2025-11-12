<template>
    <Modal :is-open="isOpen" :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'" size="md" @close="$emit('close')">
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Nombre -->
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                </label>
                <input id="name" v-model="form.name" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa el nombre completo" />
            </div>

            <!-- Email -->
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico *
                </label>
                <input id="email" v-model="form.email" type="email" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="usuario@ejemplo.com" />
            </div>

            <!-- Rol -->
            <div>
                <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                </label>
                <select id="role" v-model="form.role" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Selecciona un rol</option>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>

            <!-- Avatar URL -->
            <div>
                <label for="avatar" class="block text-sm font-medium text-gray-700 mb-1">
                    URL del Avatar
                </label>
                <input id="avatar" v-model="form.avatar" type="url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/avatar.jpg" />
                <p class="mt-1 text-xs text-gray-500">
                    Opcional. Si no se proporciona, se generará automáticamente.
                </p>
            </div>

            <!-- Preview del avatar -->
            <div v-if="form.avatar || form.name" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                    <img v-if="form.avatar" :src="form.avatar" :alt="form.name" class="w-full h-full object-cover"
                        @error="form.avatar = ''" />
                    <span v-else class="text-blue-600 font-medium text-lg">
                        {{ form.name?.charAt(0)?.toUpperCase() || 'U' }}
                    </span>
                </div>
                <div>
                    <p class="font-medium text-gray-900">{{ form.name || 'Nombre del usuario' }}</p>
                    <p class="text-sm text-gray-500">{{ form.email || 'email@ejemplo.com' }}</p>
                    <span v-if="form.role"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                        :class="form.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                        {{ form.role === 'admin' ? 'Administrador' : 'Usuario' }}
                    </span>
                </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
                <p class="text-sm text-red-800">{{ error }}</p>
            </div>
        </form>

        <template #footer>
            <div class="flex justify-end space-x-3">
                <button type="button" @click="$emit('close')"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Cancelar
                </button>
                <button type="button" @click="handleSubmit" :disabled="loading"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="loading">Guardando...</span>
                    <span v-else>{{ isEditing ? 'Actualizar' : 'Crear' }}</span>
                </button>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { UserService, type User } from '~/services/UserService'

interface Props {
    isOpen: boolean
    user?: User | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    saved: [user: User]
}>()

const userService = new UserService()
const loading = ref(false)
const error = ref('')

const isEditing = computed(() => !!props.user)

const form = ref({
    name: '',
    email: '',
    role: '' as 'admin' | 'user' | '',
    avatar: ''
})

// Reset form when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        if (props.user) {
            // Editing existing user
            form.value = {
                name: props.user.name,
                email: props.user.email,
                role: props.user.role,
                avatar: props.user.avatar || ''
            }
        } else {
            // Creating new user
            form.value = {
                name: '',
                email: '',
                role: '',
                avatar: ''
            }
        }
        error.value = ''
    }
})

const handleSubmit = async () => {
    if (loading.value) return

    loading.value = true
    error.value = ''

    try {
        let savedUser: User

        if (isEditing.value && props.user) {
            const updatedUser = await userService.updateUser(props.user.id, form.value)
            if (!updatedUser) {
                throw new Error('No se pudo actualizar el usuario')
            }
            savedUser = updatedUser
        } else {
            savedUser = await userService.createUser(form.value as Omit<User, 'id' | 'createdAt'>)
        }

        emit('saved', savedUser)
        emit('close')
    } catch (err) {
        console.error('Error saving user:', err)
        error.value = err instanceof Error ? err.message : 'Error al guardar el usuario'
    } finally {
        loading.value = false
    }
}
</script>
