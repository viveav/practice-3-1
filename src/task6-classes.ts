// ============================================================================
// Практика 3: Классы и ООП
// ============================================================================
// Цель: заменить функциональный каталог из Практик 2.1-2.2
// на класс с состоянием.
//
// Проверка: npm test -- task6
// ============================================================================

import { Book } from "./task1-types";
import { filterByTitle, sortBooks } from "./task5-utils";

export class BookCatalog {
  private books: Book[];
  readonly id: string;

  constructor(id: string, books: Book[] = []) {
    this.id = id;
    this.books = [...books];
  }


  addBook = (book: Book): void => {
    this.books = [...this.books, book];
  };


  removeBook = (id: string): void => {
    this.books = this.books.filter((book) => book.id !== id);
  };


  getBooks = (): Book[] => {
    return [...this.books];
  };


  searchByTitle = (query: string): Book[] => {
    return this.books.filter(filterByTitle(query));
  };


  sortBy = (sortType: "year" | "rating"): Book[] => {
    return sortBooks([...this.books], sortType);
  };
  

  get count(): number {
    return this.books.length;
  }
}

/*
Реализуйте класс BookCatalog.

Состояние:
  - books: Book[]       - приватное, снаружи недоступно
  - id: string          - readonly

Конструктор: (id: string, books: Book[] = [])

Публичный API:
  addBook(book: Book): void
  removeBook(id: string): void
  getBooks(): Book[]
  searchByTitle(query: string): Book[]
  sortBy(sortType: 'year' | 'rating'): Book[]
  get count(): number

Требования:
  - addBook / removeBook не мутируют массив, а создают новый
  - searchByTitle и sortBy переиспользуют filterByTitle / sortBooks
  - внешний код не может присвоить this.books напрямую

Бонус: класс Book с полями id, title, authors, year?, rating?,
методом format() и статическим createFromFormData(FormData).
*/
export class BookClass implements Book {
    readonly id: string;
    title: string;
    authors: string[];
    year?: number;
    rating?: number;

    constructor(id: string, title: string, authors: string[], year?: number, rating?: number) {
        this.id = id;
        this.title = title;
        this.authors = [...authors];
        this.year = year;
        this.rating = rating;
    }

    format(): string {
        const authorsStr = this.authors.join(", ");
        const yearInfo = this.year ? `, ${this.year} г.` : '';
        const ratingInfo = this.rating ? ` (Рейтинг: ${this.rating}/5)` : '';
        return `«${this.title}» — ${authorsStr}${yearInfo}${ratingInfo}`;
    }

    static createFromFormData(formData: FormData): BookClass {
        const id = formData.get("id") as string || crypto.randomUUID();
        const title = formData.get("title") as string;
        
        const rawAuthors = formData.get("authors") as string || "";
        const authors = rawAuthors.split(",").map(a => a.trim()).filter(Boolean);
        
        const rawYear = formData.get("year");
        const year = rawYear ? Number(rawYear) : undefined;
        
        const rawRating = formData.get("rating");
        const rating = rawRating ? Number(rawRating) : undefined;

        if (!title || authors.length === 0) {
            throw new Error("Название книги и ХОТЯ БЫ один автор обязательны");
        }

        return new BookClass(id, title, authors, year, rating);
    }
}
