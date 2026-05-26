describe('GameHub — трекер игр', () => {
    beforeEach(() => {
        cy.visit('/');
        // Очищаем localStorage перед каждым тестом
        cy.clearLocalStorage();
    });

    describe('Проверка базового UI', () => {
        it('заголовок отображается корректно', () => {
            cy.get('h1').should('be.visible');
            cy.get('h1').should('contain', 'GameHub');
        });

        it('основные элементы интерфейса загружены', () => {
            cy.get('.games-grid').should('be.visible');
            cy.get('.game-card').should('have.length.at.least', 1);
            cy.get('#searchInput').should('exist');
            cy.get('#genreFilter').should('exist');
            cy.get('#sortBy').should('exist');
        });
    });

    describe('Тестирование поиска', () => {
        it('поиск находит соответствующие игры', () => {
            cy.get('#searchInput').type('Witcher');
            cy.get('.game-card').should('have.length', 1);
            cy.get('.game-card').first().should('contain', 'Witcher');
        });

        it('поиск показывает "ничего не найдено" при отсутствии результатов', () => {
            cy.get('#searchInput').type('НесуществующаяИгра123');
            cy.get('.no-results').should('be.visible');
            cy.get('.no-results').should('contain', 'Ничего не найдено');
        });

        it('поиск работает без учёта регистра', () => {
            cy.get('#searchInput').type('WITCHER');
            cy.get('.game-card').should('have.length', 1);
            cy.get('.game-card').first().should('contain', 'Witcher');
        });
    });

    describe('Тестирование фильтрации по жанру', () => {
        it('фильтр RPG показывает только RPG игры', () => {
            cy.get('#genreFilter').select('RPG');
            cy.get('.game-card').each($card => {
                cy.wrap($card).should('contain', 'RPG');
            });
        });

        it('фильтр "Все жанры" показывает все игры', () => {
            cy.get('#genreFilter').select('Shooter');
            cy.get('.game-card').then($shooterCards => {
                const shooterCount = $shooterCards.length;
                cy.get('#genreFilter').select('all');
                cy.get('.game-card').should('have.length.gt', shooterCount);
            });
        });
    });

    describe('Тестирование сортировки', () => {
        it('сортировка по цене (дешевле → дороже) работает', () => {
            cy.get('#sortBy').select('price-asc');
            cy.get('.game-card__price').then($prices => {
                const prices = [...$prices].map(el => 
                    parseInt(el.innerText.replace(/[^\d]/g, ''))
                );
                for (let i = 0; i < prices.length - 1; i++) {
                    expect(prices[i]).to.be.lte(prices[i + 1]);
                }
            });
        });

        it('сортировка по рейтингу (высокий → низкий) работает', () => {
            cy.get('#sortBy').select('rating-desc');
            cy.get('.game-card__rating').then($ratings => {
                const ratings = [...$ratings].map(el => 
                    parseFloat(el.innerText.replace('⭐', ''))
                );
                for (let i = 0; i < ratings.length - 1; i++) {
                    expect(ratings[i]).to.be.gte(ratings[i + 1]);
                }
            });
        });
    });

    describe('Тестирование лайков (избранное)', () => {
        it('клик по кнопке лайка добавляет игру в избранное', () => {
            cy.get('.like-btn').first().click();
            cy.get('.favorites-info__count').should('contain', '1');
            cy.get('.like-btn').first().should('have.class', 'like-btn--active');
        });

        it('повторный клик убирает игру из избранного', () => {
            cy.get('.like-btn').first().click();
            cy.get('.favorites-info__count').should('contain', '1');
            cy.get('.like-btn').first().click();
            cy.get('.favorites-info__count').should('contain', '0');
            cy.get('.like-btn').first().should('not.have.class', 'like-btn--active');
        });

        it('лайки сохраняются в localStorage', () => {
            cy.get('.like-btn').first().click();
            cy.reload();
            cy.get('.like-btn').first().should('have.class', 'like-btn--active');
            cy.get('.favorites-info__count').should('contain', '1');
        });
    });

    describe('Тестирование калькулятора стоимости', () => {
        it('общая стоимость корректно отображается', () => {
            cy.get('.calculator__value').invoke('text').then(price => {
                expect(parseInt(price.replace(/\s/g, ''))).to.be.greaterThan(0);
            });
        });

        it('стоимость обновляется при фильтрации', () => {
            cy.get('#genreFilter').select('RPG');
            cy.get('.calculator__value').should('be.visible');
        });
    });

    describe('Тестирование адаптивности', () => {
        it('корректно отображается на мобильных устройствах', () => {
            cy.viewport('iphone-x');
            cy.get('.container').should('be.visible');
            cy.get('.games-grid').should('be.visible');
        });

        it('корректно отображается на планшете', () => {
            cy.viewport('ipad-2');
            cy.get('.container').should('be.visible');
            cy.get('.games-grid').should('be.visible');
        });
    });
});