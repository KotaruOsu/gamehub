// База данных игр
const gamesData = [
    { id: 1, title: "The Witcher 3", genre: "RPG", price: 999, rating: 4.9, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop", liked: false },
    { id: 2, title: "Cyberpunk 2077", genre: "RPG", price: 1999, rating: 4.5, image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop", liked: false },
    { id: 3, title: "Call of Duty", genre: "Shooter", price: 2999, rating: 4.7, image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=300&fit=crop", liked: false },
    { id: 4, title: "Minecraft", genre: "Adventure", price: 1499, rating: 4.8, image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=300&fit=crop", liked: false },
    { id: 5, title: "Civilization VI", genre: "Strategy", price: 1299, rating: 4.4, image: "https://images.unsplash.com/photo-1614680376739-414d95ffebdf?w=400&h=300&fit=crop", liked: false },
    { id: 6, title: "Doom Eternal", genre: "Shooter", price: 2499, rating: 4.6, image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop", liked: false },
    { id: 7, title: "Stardew Valley", genre: "RPG", price: 799, rating: 4.9, image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=300&fit=crop", liked: false },
    { id: 8, title: "Hades", genre: "Action", price: 1099, rating: 4.8, image: "https://images.unsplash.com/photo-1614292277779-9cae17778503?w=400&h=300&fit=crop", liked: false }
];

// Состояние приложения
let games = [...gamesData];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Загрузка лайков из localStorage
games = games.map(game => ({
    ...game,
    liked: favorites.includes(game.id)
}));

// DOM элементы
const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const sortBy = document.getElementById('sortBy');
const totalPriceSpan = document.getElementById('totalPrice');
const favoritesCountSpan = document.getElementById('favoritesCount');
const noResultsDiv = document.getElementById('noResults');

// Обновление счётчиков
function updateCounters() {
    const favoritesCount = games.filter(g => g.liked).length;
    favoritesCountSpan.textContent = favoritesCount;
    
    const totalPrice = games.reduce((sum, game) => sum + game.price, 0);
    totalPriceSpan.textContent = totalPrice.toLocaleString('ru-RU');
}

// Сохранение избранного в localStorage
function saveFavorites() {
    const favoriteIds = games.filter(g => g.liked).map(g => g.id);
    localStorage.setItem('favorites', JSON.stringify(favoriteIds));
}

// Обработка лайка
function handleLike(gameId) {
    const gameIndex = games.findIndex(g => g.id === gameId);
    if (gameIndex !== -1) {
        games[gameIndex].liked = !games[gameIndex].liked;
        saveFavorites();
        renderGames();
    }
}

// Рендер игр
function renderGames() {
    let filteredGames = [...games];
    
    // Поиск
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredGames = filteredGames.filter(game => 
            game.title.toLowerCase().includes(searchTerm)
        );
    }
    
    // Фильтр по жанру
    const genre = genreFilter.value;
    if (genre !== 'all') {
        filteredGames = filteredGames.filter(game => game.genre === genre);
    }
    
    // Сортировка
    const sortValue = sortBy.value;
    switch (sortValue) {
        case 'price-asc':
            filteredGames.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredGames.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            filteredGames.sort((a, b) => b.rating - a.rating);
            break;
        case 'rating-asc':
            filteredGames.sort((a, b) => a.rating - b.rating);
            break;
        default:
            filteredGames.sort((a, b) => a.id - b.id);
    }
    
    // Показать/скрыть сообщение "ничего не найдено"
    if (filteredGames.length === 0) {
        gamesGrid.style.display = 'none';
        noResultsDiv.style.display = 'block';
    } else {
        gamesGrid.style.display = 'grid';
        noResultsDiv.style.display = 'none';
    }
    
    // Отрисовка карточек
    gamesGrid.innerHTML = filteredGames.map(game => `
        <div class="game-card" data-id="${game.id}" data-genre="${game.genre}" data-title="${game.title}">
            <img class="game-card__image" src="${game.image}" alt="${game.title}" loading="lazy">
            <div class="game-card__content">
                <h3 class="game-card__title">${game.title}</h3>
                <p class="game-card__genre">🎮 ${game.genre}</p>
                <div class="game-card__info">
                    <span class="game-card__price">${game.price.toLocaleString('ru-RU')} ₽</span>
                    <span class="game-card__rating">⭐ ${game.rating}</span>
                </div>
                <div class="game-card__actions">
                    <button class="like-btn ${game.liked ? 'like-btn--active' : ''}" data-id="${game.id}">
                        ${game.liked ? '❤️' : '🤍'} <span class="like-btn__count">${game.liked ? 'В избранном' : 'В избранное'}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Добавляем обработчики на кнопки лайков
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const gameId = parseInt(btn.dataset.id);
            handleLike(gameId);
        });
    });
    
    updateCounters();
}

// Обработчики событий
searchInput.addEventListener('input', () => renderGames());
genreFilter.addEventListener('change', () => renderGames());
sortBy.addEventListener('change', () => renderGames());

// Инициализация
renderGames();