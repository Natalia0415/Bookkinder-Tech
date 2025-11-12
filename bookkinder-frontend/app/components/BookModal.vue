<template>
    <Modal :is-open="isOpen" :title="isEditing ? 'Editar Libro' : 'Nuevo Libro'" size="lg" @close="$emit('close')">
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Título -->
            <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                </label>
                <input id="title" v-model="form.title" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa el título del libro" />
            </div>

            <!-- Autor -->
            <div>
                <label for="author" class="block text-sm font-medium text-gray-700 mb-1">
                    Autor *
                </label>
                <input id="author" v-model="form.author" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa el nombre del autor" />
            </div>

            <!-- ISBN -->
            <div>
                <label for="isbn" class="block text-sm font-medium text-gray-700 mb-1">
                    ISBN *
                </label>
                <input id="isbn" v-model="form.isbn" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="978-84-376-0494-7" />
            </div>

            <!-- Categoría -->
            <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                </label>
                <select id="category" v-model="form.category" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Selecciona una categoría</option>
                    <option value="Clásicos">Clásicos</option>
                    <option value="Ciencia Ficción">Ciencia Ficción</option>
                    <option value="Realismo Mágico">Realismo Mágico</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Fantasía">Fantasía</option>
                    <option value="Romance">Romance</option>
                    <option value="Misterio">Misterio</option>
                    <option value="Historia">Historia</option>
                </select>
            </div>

            <!-- Descripción -->
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                </label>
                <textarea id="description" v-model="form.description" required rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el libro..."></textarea>
            </div>

            <!-- Grid de campos numéricos -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Páginas -->
                <div>
                    <label for="pages" class="block text-sm font-medium text-gray-700 mb-1">
                        Páginas *
                    </label>
                    <input id="pages" v-model.number="form.pages" type="number" required min="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="300" />
                </div>

                <!-- Año de publicación -->
                <div>
                    <label for="published_year" class="block text-sm font-medium text-gray-700 mb-1">
                        Año *
                    </label>
                    <input id="published_year" v-model.number="form.published_year" type="number" required min="1000"
                        :max="new Date().getFullYear()"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="2024" />
                </div>

                <!-- Rating -->
                <div>
                    <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">
                        Calificación *
                    </label>
                    <input id="rating" v-model.number="form.rating" type="number" required min="0" max="5" step="0.1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="4.5" />
                </div>
            </div>

            <!-- Grid de precio y stock -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Precio -->
                <div>
                    <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
                        Precio (€) *
                    </label>
                    <input id="price" v-model.number="form.price" type="number" required min="0" step="0.01"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="19.99" />
                </div>

                <!-- Stock -->
                <div>
                    <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">
                        Stock *
                    </label>
                    <input id="stock" v-model.number="form.stock" type="number" required min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10" />
                </div>
            </div>

            <!-- URL de portada -->
            <div>
                <label for="cover_image" class="block text-sm font-medium text-gray-700 mb-1">
                    URL de Portada
                </label>
                <input id="cover_image" v-model="form.cover_image" type="url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/portada.jpg" />
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
import { BookService, type Book } from '~/services/BookService'

interface Props {
    isOpen: boolean
    book?: Book | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    saved: [book: Book]
}>()

const bookService = new BookService()
const loading = ref(false)
const error = ref('')

const isEditing = computed(() => !!props.book)

const form = ref({
    title: '',
    author: '',
    isbn: '',
    description: '',
    cover_image: '',
    category: '',
    pages: 0,
    published_year: new Date().getFullYear(),
    rating: 0,
    price: 0,
    stock: 0
})

// Reset form when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        if (props.book) {
            // Editing existing book
            form.value = {
                title: props.book.title,
                author: props.book.author,
                isbn: props.book.isbn,
                description: props.book.description,
                cover_image: props.book.cover_image || '',
                category: props.book.category,
                pages: props.book.pages,
                published_year: props.book.published_year,
                rating: props.book.rating,
                price: props.book.price,
                stock: props.book.stock
            }
        } else {
            // Creating new book
            form.value = {
                title: '',
                author: '',
                isbn: '',
                description: '',
                cover_image: '',
                category: '',
                pages: 0,
                published_year: new Date().getFullYear(),
                rating: 0,
                price: 0,
                stock: 0
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
        let savedBook: Book

        if (isEditing.value && props.book) {
            savedBook = await bookService.updateBook(props.book.id, form.value)
            if (!savedBook) {
                throw new Error('No se pudo actualizar el libro')
            }
        } else {
            // Create new book
            savedBook = await bookService.createBook(form.value)
        }

        emit('saved', savedBook)
        emit('close')
    } catch (err) {
        console.error('Error saving book:', err)
        error.value = err instanceof Error ? err.message : 'Error al guardar el libro'
    } finally {
        loading.value = false
    }
}
</script>
