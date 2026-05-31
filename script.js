// ========================================================
// 1. ОТКЛЮЧЕНИЕ ПРЕЛОАДЕРА (Фикс "вечной загрузки")
// ========================================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 500);
    }
});

// ========================================================
// 2. ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ (TOAST)
// ========================================================
window.showToast = function(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 300); 
    }, 3000);
};

// ========================================================
// 3. ОСНОВНАЯ ЛОГИКА КАТАЛОГА
// ========================================================
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const container = document.getElementById('catalog-container');

const paginationContainer = document.createElement('div');
paginationContainer.style.cssText = 'width: 100%; display: flex; justify-content: center; gap: 10px; margin-top: 30px; margin-bottom: 50px;';
if(container) container.after(paginationContainer);

let currentPage = 1;
const limitPerPage = 6;
window.currentProducts = []; // Сделали глобальным

// Динамически создаем HTML для модального окна просмотра товара
const productModalHTML = `
<div class="modal-overlay" id="productDetailModal">
    <div class="modal-content" style="display:flex; gap: 20px; max-width: 600px;">
        <span class="modal-close" onclick="closeProductModal()" style="position:absolute; top:10px; right:15px; font-size:28px; cursor:pointer;">&times;</span>
        <img id="modalProdImg" src="" style="width: 200px; height: 200px; object-fit: contain;">
        <div style="font-family: 'Roboto', sans-serif;">
            <h2 id="modalProdName" style="margin-top:0;">Название</h2>
            <p style="color: #FF5A45; font-size: 24px; font-weight: bold; margin: 10px 0;" id="modalProdPrice">$0.00</p>
            <p>Категория: <b id="modalProdCat"></b></p>
            <p id="modalProdStock" style="margin-bottom: 20px;"></p>
            <button id="modalAddToCartBtn" style="background: #FF5A45; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.3s;">В корзину</button>
        </div>
    </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', productModalHTML);

window.closeProductModal = function() {
    const modal = document.getElementById('productDetailModal');
    if(modal) modal.classList.remove('active');
};

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
    } catch (error) { console.error(error); }
}

window.fetchProducts = async function() {
    if (!container) return; // Запускаем только если мы на странице каталога
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

        url.searchParams.append('_page', currentPage);
        url.searchParams.append('_limit', limitPerPage);

        const response = await fetch(url);
        const totalCount = response.headers.get('X-Total-Count');
        const totalPages = Math.ceil(totalCount / limitPerPage);

        window.currentProducts = await response.json();
        renderCatalog(window.currentProducts);
        renderPagination(totalPages);
    } catch (error) {
        if (container) {
            container.innerHTML = `<div style="text-align: center; padding: 50px 0;"><h2 style="color: #FF5A45;">Нет связи с сервером</h2><p>Убедитесь, что запущен json-server на порту 3000.</p></div>`;
        }
    }
};

function renderCatalog(items) {
    if (!container) return;
    if (!items || items.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 50px 0;"><h2>Товары не найдены</h2></div>`;
        return;
    }

    let htmlContent = '';
    items.forEach(product => {
        let priceHTML = '';
        const formatPrice = (p) => Number(p).toFixed(2);

        if (!product.inStock) {
            priceHTML = `<span class="sold_out_in_accessories">Sold Out</span>`;
        } else if (product.oldPrice) {
            priceHTML = `<span class="black_price_in_accessories">$${formatPrice(product.price)}</span>
                         <span style="text-decoration: line-through; color: #FF2121; margin-left: 6px;">$${formatPrice(product.oldPrice)}</span>`;
        } else {
            priceHTML = `<span class="black_price_in_accessories">$${formatPrice(product.price)}</span>`;
        }

        // ВАЖНО: event.stopPropagation() не дает клику провалиться к карточке и открыть модалку
        htmlContent += `
            <div class="item_card_in_accessories" style="position: relative; padding-bottom: 50px; height: 320px; cursor: pointer;" onclick="openProductModal(${product.id})">
                <img src="${product.image}" alt="${product.name}" class="item_photo_in_accessories" style="object-fit: contain;">
                <div class="item_name_in_accessories">${product.name}</div>
                <div class="price_box_in_accessories">${priceHTML}</div>
                
                <div style="position: absolute; bottom: 10px; display: flex; gap: 10px; width: 100%; justify-content: center;">
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" style="background: #FF5A45; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-family: 'Roboto'; font-weight: 700; font-size: 12px; transition: 0.3s;">В корзину</button>
                    <button onclick="event.stopPropagation(); addToFav(${product.id})" style="background: #333; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-family: 'Roboto'; font-size: 12px; transition: 0.3s;">❤</button>
                </div>
            </div>`;
    });
    container.innerHTML = htmlContent;
}

function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.cssText = `padding: 8px 16px; border: 2px solid #FF5A45; background-color: ${i === currentPage ? '#FF5A45' : 'white'}; color: ${i === currentPage ? 'white' : '#FF5A45'}; cursor: pointer; border-radius: 5px; font-weight: 700;`;
        btn.onclick = () => { currentPage = i; window.fetchProducts(); };
        paginationContainer.appendChild(btn);
    }
}

window.openProductModal = function(id) {
    const product = window.currentProducts.find(p => String(p.id) === String(id));
    if (!product) return;
    document.getElementById('modalProdImg').src = product.image;
    document.getElementById('modalProdName').innerText = product.name;
    document.getElementById('modalProdPrice').innerText = "$" + Number(product.price).toFixed(2);
    document.getElementById('modalProdCat').innerText = product.category;
    document.getElementById('modalProdStock').innerHTML = product.inStock ? "<span style='color:green;'>✅ В наличии</span>" : "<span style='color:red;'>❌ Нет в наличии</span>";
    document.getElementById('modalAddToCartBtn').onclick = () => { 
        window.addToCart(product.id); 
        closeProductModal(); 
    };
    document.getElementById('productDetailModal').classList.add('active');
};

window.addToCart = async function(id) {
    const product = window.currentProducts.find(p => String(p.id) === String(id));
    if (!product || !product.inStock) {
        window.showToast("❌ Этот товар распродан!");
        return;
    }
    try {
        const cartItem = { ...product, quantity: 1, id: Date.now().toString() }; 
        await fetch('http://localhost:3000/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cartItem) });
        window.showToast('✅ Товар добавлен в корзину!');
        if (window.updateCartCounter) window.updateCartCounter();
    } catch (e) { window.showToast('❌ Ошибка связи с сервером.'); }
};

window.addToFav = async function(id) {
    const product = window.currentProducts.find(p => String(p.id) === String(id));
    if (!product) return;
    try {
        await fetch('http://localhost:3000/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...product, id: Date.now().toString() }) });
        window.showToast('❤ Товар добавлен в избранное!');
    } catch (e) { window.showToast('❌ Ошибка связи с сервером.'); }
};

window.updateCartCounter = async function() {
    try {
        const res = await fetch('http://localhost:3000/cart');
        const cart = await res.json();
        const counter = document.getElementById('cart-counter');
        if (counter) counter.innerText = cart.length;
    } catch (e) {}
};

if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; window.fetchProducts(); });
if (categorySelect) categorySelect.addEventListener('change', () => { currentPage = 1; window.fetchProducts(); });
if (sortSelect) sortSelect.addEventListener('change', () => { currentPage = 1; window.fetchProducts(); });

// Загрузка
loadCategories().then(() => { if (container) window.fetchProducts(); });
window.updateCartCounter();

// ========================================================
// 4. ЛОГИКА ДЛЯ ЛАБОРАТОРНОЙ РАБОТЫ №9 (Эффекты и UI)
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Бургер-меню
    const burger = document.querySelector('.burger-btn') || document.getElementById('burgerIcon');
    const menu = document.querySelector('.mobile-menu') || document.getElementById('mobileMenu');
    const overlay = document.querySelector('.overlay') || document.getElementById('burgerOverlay');

    if (burger && menu && overlay) {
        const toggleMenu = () => {
            burger.classList.toggle('active');
            menu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('lock-scroll', burger.classList.contains('active'));
        };
        burger.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        menu.querySelectorAll('a').forEach(link => link.addEventListener('click', toggleMenu));
    }

    // Parallax-эффект
    const parallax = document.querySelector('.parallax-container') || document.getElementById('parallaxSection');
    if(parallax) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const offset = parallax.offsetTop;
            if (scrolled + window.innerHeight > offset && scrolled < offset + parallax.offsetHeight) {
                const shift = scrolled - offset;
                const bg = document.querySelector('.layer-bg') || document.querySelector('.parallax-bg');
                const mid = document.querySelector('.layer-mid') || document.querySelector('.parallax-mid');
                const front = document.querySelector('.layer-front') || document.querySelector('.parallax-front');
                const reverse = document.querySelector('.layer-reverse');
                
                if (bg) bg.style.transform = `translateY(${shift * 0.4}px)`; 
                if (mid) mid.style.transform = `translateY(${shift * 0.15}px)`;
                if (front) front.style.transform = `translateY(${shift * 0.05}px)`; // Теперь текст плавно сдвигается только по вертикали
                if (reverse) reverse.style.transform = `translateY(${-shift * 0.1}px)`; 
            }
        });
    }

    // Анимация при скролле
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll, .feature_item_in_final').forEach(el => {
        el.style.opacity = 0; el.style.transform = 'translateY(40px)'; el.style.transition = 'all 0.6s ease';
        scrollObserver.observe(el);
    });

    // Интерактивная медиагалерея (Картинки + Звук)
    const galleryItems = document.querySelectorAll('.media-item');
    const indicator = document.getElementById('play-indicator');
    const volumeControl = document.getElementById('volume-control');

    const galleryData = [
        { img: 'photo1.jpg', sound: 'sound1.mp3' },
        { img: 'photo2.jpg', sound: 'sound2.mp3' },
        { img: 'photo3.jpg', sound: 'sound3.mp3' },
        { img: 'photo4.jpg', sound: 'sound4.mp3' },
        { img: 'photo5.jpg', sound: 'sound5.mp3' },
        { img: 'board.jpg', sound: 'sound6.mp3' },
        { img: 'scooter.jpg', sound: 'sound7.mp3' },
        { img: 'helmet.png', sound: 'sound8.mp3' },
        { img: 'zapchast1.jpg', sound: 'sound9.mp3' },
        { img: 'scaters.jpg', sound: 'sound10.mp3' }
    ];

    let currentAudio = null;
    let lastIndex = -1;

    if(galleryItems.length > 0) {
        galleryItems.forEach(imgElement => {
            imgElement.addEventListener('click', () => {
                if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
                let randomIndex;
                do { randomIndex = Math.floor(Math.random() * galleryData.length); } while (randomIndex === lastIndex);
                lastIndex = randomIndex;
                const randomItem = galleryData[randomIndex];
                
                imgElement.style.opacity = 0; 
                setTimeout(() => { imgElement.src = randomItem.img; imgElement.style.opacity = 1; }, 300);
                
                currentAudio = new Audio(randomItem.sound); 
                currentAudio.volume = volumeControl ? volumeControl.value : 0.5; 
                
                currentAudio.play().then(() => {
                    if (indicator) { indicator.style.display = 'block'; indicator.innerText = "Статус: Играет 🔊"; }
                }).catch(err => {
                    if (window.showToast) window.showToast("🔊 Файл не найден: " + randomItem.sound);
                });
                
                currentAudio.onended = () => { if (indicator) indicator.innerText = "Статус: Пауза ⏸"; };
            });
        });
    }

    if (volumeControl) {
        volumeControl.addEventListener('input', (e) => {
            if (currentAudio) currentAudio.volume = e.target.value;
        });
    }

    // Видео Модальное окно
    const videoTrigger = document.getElementById('video-trigger');
    const videoModal = document.getElementById('videoModal');
    if(videoTrigger && videoModal) {
        videoTrigger.addEventListener('click', () => videoModal.classList.add('active'));
        videoModal.querySelector('.modal-close').addEventListener('click', () => {
            videoModal.classList.remove('active');
            const iframe = videoModal.querySelector('iframe');
            if (iframe) iframe.src = iframe.src; // Остановка звука
        });
    }
});

// 4.7. Гарантированная инициализация Swiper
document.addEventListener('DOMContentLoaded', () => {
    // Ждем небольшую задержку, чтобы DOM точно отрисовался
    setTimeout(() => {
        const swiperElement = document.querySelector('.mySwiper');
        if (swiperElement) {
            new Swiper('.mySwiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: false, // Отключили loop, чтобы не ломались стрелки
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    480: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 5 }
                }
            });
            console.log("Swiper успешно инициализирован");
        } else {
            console.warn("Элемент .mySwiper не найден на странице");
        }
    }, 300);
});