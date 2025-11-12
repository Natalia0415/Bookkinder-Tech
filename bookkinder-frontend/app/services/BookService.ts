import { ApiService } from './ApiService';

export interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    description: string;
    coverImage?: string;
    category: string;
    pages: number;
    publishedYear: number;
    rating: number;
    price: number;
    stock: number;
    createdAt: string;
}

export class BookService extends ApiService {

    getBooks(): Promise<Book[]> {
        return this.get('api/books');
    }

    createBook(bookData: Omit<Book, 'id' | 'createdAt'>): Promise<Book> {
        return this.post('api/books/store', bookData);
    }

    updateBook(id: number, bookData: Partial<Book>): Promise<Book> {
        return this.put(`api/books/update/${id}`, bookData);
    }

    deleteBook(id: number): Promise<boolean> {
        return this.delete(`api/books/delete/${id}`);
    }

    searchBooks(query: string): Promise<Book[]> {
        return this.get(`api/books/search/${query}`);
    }

    getBooksByCategory(category: string): Promise<Book[]> {
        return this.get(`api/books/category/${category}`);
    }

    getTopRatedBooks(limit: number = 5): Promise<Book[]> {
        return this.get(`api/books/top-rated/${limit}`);
    }
}

