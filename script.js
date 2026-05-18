const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const container = document.getElementById('catalog-container');

const paginationContainer = document.createElement('div');
paginationContainer.style.cssText = 'width: 100%; display: flex; justify-content: center; gap: 10px; margin-top: 30px; margin-bottom: 50px;';
container.after(paginationContainer);

let currentPage = 1;
const limitPerPage = 6;
let currentProducts = [];

async function loadCategories() {
    try {
        const res = await fetch('http://localhost:3000/products');
        const data = await res.json();
        
        const categoriesSet = new Set(data.map(item => item.category));

        if (categorySelect) {
            categorySelect.innerHTML = '<option value="All">Все категории</option>';
            categoriesSet.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}
async function fetchProducts() {
    try {
        let url = new URL('http://localhost:3000/products');

        const query = searchInput ? searchInput.value.trim() : '';
        if (query) url.searchParams.append('q', query);

        const category = categorySelect ? categorySelect.value : 'All';
        if (category !== 'All') url.searchParams.append('category', category);

        const sortMode = sortSelect ? sortSelect.value : 'default';
        if (sortMode === 'priceAsc') { url.searchParams.append('_sort', 'price'); url.searchParams.append('_order', 'asc'); }
        else if (sortMode === 'priceDesc') { url.searchParams.append('_sort', 'price'); url.searchParams.append('_order', 'desc'); }
        else if (sortMode === 'nameAsc') { url.searchParams.append('_sort', 'name'); url.searchParams.append('_order', 'asc'); }
        else if (sortMode === 'ratingDesc') { url.searchParams.append('_sort', 'rating'); url.searchParams.append('_order', 'desc'); }

        url.searchParams.append('_page', currentPage);
        url.searchParams.append('_limit', limitPerPage);

        const response = await fetch(url);
        
        const totalCount = response.headers.get('X-Total-Count');
        const totalPages = Math.ceil(totalCount / limitPerPage);

        const products = await response.json();
        currentProducts = products;
        
        renderCatalog(products);
        renderPagination(totalPages);

    } catch (error) {
        console.error("Ошибка при запросе к серверу:", error);
    }
}

function renderCatalog(items) {
    if (!container) return;

    if (!items || items.length === 0) {
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
            <div class="item_card_in_accessories" style="position: relative; padding-bottom: 50px; height: 320px;">
                <img src="${product.image}" alt="${product.name}" class="item_photo_in_accessories" style="object-fit: contain;">
                <div class="item_name_in_accessories">${product.name}</div>
                <div class="price_box_in_accessories">${priceHTML}</div>
                
                <div style="position: absolute; bottom: 10px; display: flex; gap: 10px; width: 100%; justify-content: center;">
                    <button onclick="addToCart(${product.id})" style="background: #FF5A45; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-family: 'Roboto'; font-weight: 700; font-size: 12px; transition: 0.3s;">В корзину</button>
                    <button onclick="addToFav(${product.id})" style="background: #333; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-family: 'Roboto'; font-size: 12px; transition: 0.3s;">❤</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
}

function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.cssText = `
            padding: 8px 16px; 
            border: 2px solid #FF5A45; 
            background-color: ${i === currentPage ? '#FF5A45' : 'white'}; 
            color: ${i === currentPage ? 'white' : '#FF5A45'}; 
            cursor: pointer; 
            border-radius: 5px;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
        `;
        
        btn.onclick = () => {
            currentPage = i;
            fetchProducts();
        };
        paginationContainer.appendChild(btn);
    }
}

async function addToCart(id) {
    const product = currentProducts.find(p => String(p.id) === String(id));
    if (!product || !product.inStock) {
        alert("Этот товар распродан!");
        return;
    }

    try {
        const cartItem = { ...product, quantity: 1, id: Date.now().toString() }; 
        await fetch('http://localhost:3000/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItem)
        });
        alert('✅ Товар добавлен в корзину!');
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
    }
}

async function addToFav(id) {
    const product = currentProducts.find(p => String(p.id) === String(id));
    if (!product) return;

    try {
        await fetch('http://localhost:3000/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, id: Date.now().toString() })
        });
        alert('❤ Товар добавлен в избранное!');
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
    }
}

if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; fetchProducts(); });
if (categorySelect) categorySelect.addEventListener('change', () => { currentPage = 1; fetchProducts(); });
if (sortSelect) sortSelect.addEventListener('change', () => { currentPage = 1; fetchProducts(); });

loadCategories().then(fetchProducts);