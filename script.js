console.log("--- Скрипт успешно подключен и начал работу! ---");

function renderCatalog(items) {
    console.log("5. Функция отрисовки запущена. Массив товаров:", items);
    
    const container = document.getElementById('catalog-container');
    console.log("6. Ищем контейнер catalog-container. Нашли?", container);

    if (!container) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА: Контейнер не найден! Скрипт остановлен.");
        return;
    }

    if (!items || items.length === 0) {
        console.log("-> Сервер вернул пустой массив. Рисуем надпись 'Товары не найдены'.");
        container.innerHTML = `
            <div style="width: 100%; text-align: center; padding: 50px 0;">
                <h2 style="color: #FF5A45; font-family: 'Roboto', sans-serif;">Товары не найдены</h2>
                <p style="color: #777; font-family: 'Roboto', sans-serif;">Попробуйте изменить параметры поиска или фильтры.</p>
            </div>
        `;
        return;
    }

    let htmlContent = '';
    items.forEach(product => {
        let priceHTML = '';
        const formatPrice = (p) => Number(p).toFixed(2);

        if (!product.inStock) {
            priceHTML = `<span class="sold_out_in_accessories">Sold Out</span>`;
        } else if (product.oldPrice) {
            priceHTML = `
                <span class="black_price_in_accessories">$${formatPrice(product.price)}</span>
                <span style="text-decoration: line-through; color: #FF2121; margin-left: 6px;">$${formatPrice(product.oldPrice)}</span>
            `;
        } else {
            priceHTML = `<span class="black_price_in_accessories">$${formatPrice(product.price)}</span>`;
        }

        htmlContent += `
            <div class="item_card_in_accessories">
                <img src="${product.image}" alt="${product.name}" class="item_photo_in_accessories" style="object-fit: contain;">
                <div class="item_name_in_accessories">${product.name}</div>
                <div class="price_box_in_accessories">
                    ${priceHTML}
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
    console.log("7. Отрисовка карточек успешно завершена!");
}

const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

async function fetchProducts() {
    console.log("1. Начинаем запрос к серверу...");
    try {
        let url = new URL('http://localhost:3000/products');

        const query = searchInput ? searchInput.value.trim() : '';
        if (query) url.searchParams.append('q', query);

        const category = categorySelect ? categorySelect.value : 'All';
        if (category !== 'All') url.searchParams.append('category', category);

        const sortMode = sortSelect ? sortSelect.value : 'default';
        if (sortMode === 'priceAsc') {
            url.searchParams.append('_sort', 'price');
            url.searchParams.append('_order', 'asc');
        } else if (sortMode === 'priceDesc') {
            url.searchParams.append('_sort', 'price');
            url.searchParams.append('_order', 'desc');
        } else if (sortMode === 'nameAsc') {
            url.searchParams.append('_sort', 'name');
            url.searchParams.append('_order', 'asc');
        } else if (sortMode === 'ratingDesc') {
            url.searchParams.append('_sort', 'rating');
            url.searchParams.append('_order', 'desc');
        }

        console.log("2. Сформирована ссылка:", url.toString());

        const response = await fetch(url);
        console.log("3. Ответ от сервера получен. HTTP Статус:", response.status);

        const productsFromServer = await response.json();
        console.log("4. Данные расшифрованы (JSON -> JS массив). Передаем в отрисовку.");
        
        renderCatalog(productsFromServer);
        
    } catch (error) {
        console.error("ОШИБКА ПРИ ЗАПРОСЕ (СЕРВЕР УПАЛ ИЛИ НЕ ЗАПУЩЕН):", error);
    }
}

if (searchInput) searchInput.addEventListener('input', fetchProducts);
if (categorySelect) categorySelect.addEventListener('change', fetchProducts);
if (sortSelect) sortSelect.addEventListener('change', fetchProducts);

console.log("0. Запускаем первичную загрузку товаров...");
fetchProducts();