<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookService, type Book } from '~/services/BookService'
import BookModal from '~/components/BookModal.vue'
import { useAuth } from '../composables/useAuth'

const auth = useAuth();

definePageMeta({
    middleware: ['auth'],
})

const bookService = new BookService()
const books = ref<Book[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const filteredBooks = ref<Book[]>([])

// Modal state
const showBookModal = ref(false)
const editingBook = ref<Book | null>(null)

const categories = [
    'Todos',
    'Clásicos',
    'Ciencia Ficción',
    'Realismo Mágico',
    'Infantil',
    'Fantasía'
]

onMounted(async () => {
    try {
        books.value = await bookService.getBooks()
        filteredBooks.value = books.value
    } catch (error) {
        console.error('Error loading books:', error)
    } finally {
        loading.value = false
    }
})

const handleSearch = async () => {
    if (searchQuery.value.trim()) {
        try {
            filteredBooks.value = await bookService.searchBooks(searchQuery.value)
        } catch (error) {
            console.error('Error searching books:', error)
        }
    } else {
        filteredBooks.value = books.value
    }
}

const handleCategoryFilter = async (category: string) => {
    selectedCategory.value = category
    if (category === 'Todos') {
        filteredBooks.value = books.value
    } else {
        try {
            filteredBooks.value = await bookService.getBooksByCategory(category)
        } catch (error) {
            console.error('Error filtering books by category:', error)
        }
    }
}

const getCategoryBadgeClass = (category: string) => {
    const classes = {
        'Clásicos': 'bg-purple-100 text-purple-800',
        'Ciencia Ficción': 'bg-blue-100 text-blue-800',
        'Realismo Mágico': 'bg-green-100 text-green-800',
        'Infantil': 'bg-yellow-100 text-yellow-800',
        'Fantasía': 'bg-pink-100 text-pink-800'
    }
    return classes[category as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(price)
}

const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Agotado', class: 'bg-red-100 text-red-800' }
    if (stock < 5) return { text: 'Pocas unidades', class: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Disponible', class: 'bg-green-100 text-green-800' }
}

// Modal functions
const openCreateModal = () => {
    editingBook.value = null
    showBookModal.value = true
}

const openEditModal = (book: Book) => {
    editingBook.value = book
    showBookModal.value = true
}

const closeModal = () => {
    showBookModal.value = false
    editingBook.value = null
}

const handleBookSaved = async (_savedBook: Book) => {
    try {
        books.value = await bookService.getBooks()
        if (selectedCategory.value === 'Todos' || selectedCategory.value === '') {
            filteredBooks.value = books.value
        } else {
            filteredBooks.value = await bookService.getBooksByCategory(selectedCategory.value)
        }
    } catch (error) {
        console.error('Error refreshing books:', error)
    }
}

const handleDeleteBook = async (book: Book) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${book.title}"?`)) {
        try {
            
            await bookService.deleteBook(book.id)

            books.value = books.value.filter(b => b.id !== book.id)
            filteredBooks.value = filteredBooks.value.filter(b => b.id !== book.id)
            
        } catch (error) {
            console.error('Error deleting book:', error)
            alert('Error al eliminar el libro')
        }
    }
}
</script>

<template>
    <div>
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Biblioteca</h1>
                    <p class="text-gray-600 mt-1">Explora la colección de libros</p>
                </div>
                <button 
                    v-if="auth.isAuthenticated.value" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    @click="openCreateModal"
                >
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar Libro
                </button>
            </div>

            <!-- Search and Filters -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div class="flex-1 max-w-md">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg 
                                    class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                v-model="searchQuery" 
                                type="text"
                                placeholder="Buscar libros..."
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                @input="handleSearch" 
                            />
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <button 
                            v-for="category in categories" :key="category" 
                            :class="[
                                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                                selectedCategory === category || (selectedCategory === '' && category === 'Todos')
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            ]"
                            @click="handleCategoryFilter(category)"
                        >
                            {{ category }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Books Grid -->
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="i in 8" :key="i" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div class="h-48 bg-gray-200"></div>
                    <div class="p-4">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>

            <div v-else-if="filteredBooks.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No se encontraron libros</h3>
                <p class="mt-1 text-sm text-gray-500">Intenta con otros términos de búsqueda o categorías.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="book in filteredBooks" :key="book.id"
                    class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <!-- Book Cover -->
                    <div class="relative h-48 bg-gray-200">
                        <img v-if="book.coverImage" :src="book.coverImage" :alt="book.title"
                            class="w-full h-full object-cover">
                        <div v-else
                            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div class="absolute top-2 right-2">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                :class="getStockStatus(book.stock).class">
                                {{ getStockStatus(book.stock).text }}
                            </span>
                        </div>
                    </div>

                    <!-- Book Info -->
                    <div class="p-4">
                        <div class="mb-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="getCategoryBadgeClass(book.category)">
                                {{ book.category }}
                            </span>
                        </div>

                        <h3 class="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{{ book.title }}</h3>
                        <p class="text-sm text-gray-600 mb-2">{{ book.author }}</p>

                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ book.description }}</p>

                        <!-- Rating -->
                        <div class="flex items-center mb-3">
                            <div class="flex text-yellow-400">
                                <span v-for="i in 5" :key="i" class="text-sm">
                                    {{ i <= Math.floor(book.rating) ? '★' : '☆' }} </span>
                            </div>
                            <span class="ml-2 text-sm text-gray-500">{{ book.rating }}/5</span>
                        </div>

                        <!-- Price and Stock -->
                        <div class="flex items-center justify-between mb-4"></div>
                        <span class="text-lg font-bold text-blue-600">{{ formatPrice(book.price) }}</span>
                        <span class="text-sm text-gray-500">{{ book.stock }} unidades</span>
                    </div>

                    <!-- Actions -->
                    <div 
                        v-if="auth.isAuthenticated.value"
                        class="flex space-x-2" 
                    >
                        <button @click="openEditModal(book)"
                            class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                        </button>
                        <button @click="handleDeleteBook(book)"
                            class="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Book Modal -->
        <BookModal 
            :is-open="showBookModal" 
            :book="editingBook" 
            @close="closeModal" 
            @saved="handleBookSaved" 
        />
    </div>

</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>