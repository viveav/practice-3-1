import './styles.css';
import { Book } from './task1-types';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { filterByTitle, sortBooks } from './task5-utils';
import { Wishlist } from './task7-wishlist';

// TODO 3.0: импортируйте BookCatalog из task6
import { BookCatalog, BookClass } from './task6-classes';

// TODO 3.1: замените `let catalog: Catalog = {...}` на экземпляр `new BookCatalog([...те же книги...], 'main')`
// Тип `Catalog` после замены больше не нужен – уберите импорт.
const initialBooks: Book[] = [
    { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
    { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
];

let catalog = new BookCatalog('main', initialBooks);
let wishlist = new Wishlist();


// восстановление из localStorage
// Сейчас: JSON.parse кладёт в catalog простой объект – этого достаточно,
// потому что все операции идут через свободные функции addBook/removeBook.
// TODO 3.2: после перехода на класс JSON.parse вернёт объект БЕЗ методов.
// Нужно будет воссоздать экземпляр:
//   const parsed = JSON.parse(saved);
//   catalog = new BookCatalog(parsed.id, parsed.books);
const saved = localStorage.getItem('catalog');
if (saved) {
    const parsed = JSON.parse(saved);
    catalog = new BookCatalog(parsed.id, parsed.books);
}
//сохранение в localStorage
const savedWishlist = localStorage.getItem('wishlist');
if (savedWishlist) {
  const parsedIds = JSON.parse(savedWishlist);
  wishlist = new Wishlist(parsedIds);
}

function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist.ids));
}


// сохранение в localStorage
function saveCatalog() {
    localStorage.setItem('catalog', JSON.stringify({
        id: catalog.id,
        books: catalog.getBooks()
    }));
}

// DOM-элементы
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const librarySortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;

// отрисовка
// Задание 3.2: Функция создания карточки, чтобы не дублировать код в renderBooks и renderWishlist

function createBookCard(book: Book): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'book-card';

  const titleEl = document.createElement('h3');
  titleEl.textContent = `${book.title} – ${book.authors.join(', ')}${book.year ? `, \${book.year}` : ''}`;
  card.append(titleEl);

  if (book.rating !== undefined) {
    const ratingEl = document.createElement('p');
    ratingEl.textContent = `Рейтинг: ${book.rating}`;
    card.append(ratingEl);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Удалить';
  deleteBtn.addEventListener('click', () => {
    // TODO 3.3: замените функциональный removeBook на метод класса
    catalog.removeBook(book.id);
    saveCatalog();
    // TODO 3.4: замените вызов Object.values(catalog) на метод каталога getBooks()
    renderBooks(catalog.getBooks());
    if (typeof renderWishlist === 'function') renderWishlist(); // Обновляем вишлист при удалении
  });
  card.append(deleteBtn);

  // Задание 2.2: Кнопка «Избранное»
  const favBtn = document.createElement('button');
  favBtn.textContent = wishlist.has(book.id) ? '❤️ В избранном' : '🤍 В избранное';
  
  favBtn.addEventListener('click', () => {
    wishlist.toggle(book.id); // Вызываем метод переключения состояния
    saveWishlist();


    // Перерисовываем оба списка
    renderBooks(catalog.getBooks());
    if (typeof renderWishlist === 'function') renderWishlist(); 
  });
  card.append(favBtn);
  return card;
}

// Обновленная функция отрисовки основного списка книг
function renderBooks(books: Book[]) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
    // Переиспользуем общую функцию создания карточки
    bookList.append(createBookCard(book));
  });
}

function renderWishlist() {
  const container = document.querySelector('#wishlistContainer') as HTMLDivElement;
  if (!container) return;
  
  container.innerHTML = '';

  const favBooks = wishlist.getFavorites(catalog);

  if (favBooks.length === 0) {
    container.textContent = 'Пока ничего не добавлено';
    return;
  }

  favBooks.forEach(book => {
    container.append(createBookCard(book));
  });
}

// Первичная отрисовка
// TODO 3.4: замените Object.values(catalog) на метод каталога
renderBooks(catalog.getBooks());

// обработчик формы
form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.textContent = '';
    try {
        const formData = new FormData(form);
        const newBook = BookClass.createFromFormData(formData);
        
        // TODO 3.5: замените функциональный addBook на метод класса.
        catalog.addBook(newBook);
        
        saveCatalog();
        form.reset();
        
        renderBooks(catalog.getBooks());
        renderWishlist();
    } catch (error) {
        if (error instanceof Error) {
            errorMessage.textContent = error.message;
        }
    }
});

// фильтры и сортировка
function refreshList() {
    const filters: ((book: Book) => boolean)[] = [];
    
    if (authorInput.value.trim()) filters.push(filterByAuthor(authorInput.value.trim()));
    if (yearInput.value) filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
    if (searchInput.value.trim()) filters.push(filterByTitle(searchInput.value.trim()));
    
    const allBooks = catalog.getBooks();
    const filteredBooks = applyFilters(allBooks, filters);
    
    renderBooks(sortBooks(filteredBooks, librarySortBySelect.value as 'year' | 'rating'));
}

filterBtn.addEventListener('click', refreshList);
searchInput.addEventListener('input', refreshList);
librarySortBySelect.addEventListener('change', refreshList);
