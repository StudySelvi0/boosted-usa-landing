const products = [
    { id: 1, name: 'Evolve Fusion All Terrain Electric Skateboard', category: 'Boards', price: 0, oldPrice: null, rating: 4.8, image: 'scateboard.png', inStock: false },
    { id: 2, name: 'Evolve "Diablo" Carbon 2 in 1', category: 'Boards', price: 2299, oldPrice: null, rating: 4.9, image: 'scateboard2.png', inStock: true },
    { id: 3, name: 'Evolve STOKE - X Skateboard', category: 'Boards', price: 1399, oldPrice: null, rating: 4.7, image: 'scateboard3.png', inStock: true },
    { id: 4, name: 'Evolve "Diablo" Bamboo Street Electric Skateboard', category: 'Boards', price: 1999, oldPrice: 2080, rating: 4.6, image: 'scateboard4.png', inStock: true },
    
    { id: 5, name: 'Segway eKickScooter GT3 PRO', category: 'Scooters', price: 2699, oldPrice: null, rating: 4.9, image: 'scooter.png', inStock: true },
    { id: 6, name: 'Dualtron Thunder 3 Electric Scooter', category: 'Scooters', price: 3499, oldPrice: 3999, rating: 4.8, image: 'scooter2.png', inStock: true },
    
    { id: 7, name: 'Premium Helmet', category: 'Gear', price: 99, oldPrice: null, rating: 4.8, image: 'helmet.png', inStock: true },
    { id: 8, name: 'Boosted Daypack Waterproof Backpack', category: 'Gear', price: 40, oldPrice: 179, rating: 4.9, image: 'bag.png', inStock: true },
    { id: 9, name: 'Boosted T-Shirt', category: 'Gear', price: 20, oldPrice: null, rating: 4.5, image: 't-shirt.png', inStock: true },

    { id: 10, name: 'Rev Tube', category: 'Accessories', price: 16, oldPrice: 19, rating: 4.2, image: 'zapchast1.jpg', inStock: true },
    { id: 11, name: 'Boosted Rev Stem Catch', category: 'Accessories', price: 19, oldPrice: 29, rating: 4.0, image: 'zapchast2.jpg', inStock: true },
    { id: 12, name: 'Stomp Brake Fender', category: 'Accessories', price: 50, oldPrice: null, rating: 4.8, image: 'zapchast3.jpg', inStock: false }, 
    { id: 13, name: 'Boosted Belt Kit', category: 'Accessories', price: 25, oldPrice: null, rating: 4.9, image: 'zapchast4.jpg', inStock: true },
    { id: 14, name: 'Bearing Service Kit', category: 'Accessories', price: 50, oldPrice: null, rating: 4.7, image: 'zapchast5.jpg', inStock: true },
    { id: 15, name: 'Boosted Pulley / Belt Upgrade Kit', category: 'Accessories', price: 75, oldPrice: null, rating: 4.6, image: 'zapchast6.jpg', inStock: true }
];

function renderCatalog(items) {
    const container = document.getElementById('catalog-container');
    if (!container) return;

    if (items.length === 0) {
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
        const formatPrice = (p) => p.toFixed(2);

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
}

renderCatalog(products);

let workingArray = [...products]; 

document.getElementById('btn-filter').addEventListener('click', () => {
    const boards = products.filter(item => item.category === 'Boards');
    renderCatalog(boards);
});

document.getElementById('btn-reduce').addEventListener('click', () => {
    const accessories = products.reduce((acc, item) => {
        if (item.category === 'Accessories') acc.push(item);
        return acc;
    }, []);
    renderCatalog(accessories);
});

document.getElementById('btn-flatmap').addEventListener('click', () => {
    const gear = products.flatMap(item => item.category === 'Gear' ? [item] : []);
    renderCatalog(gear);
});

document.getElementById('btn-sort').addEventListener('click', () => {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    renderCatalog(sorted);
});

document.getElementById('btn-reverse').addEventListener('click', () => {
    const reversed = [...products].reverse();
    renderCatalog(reversed);
});

document.getElementById('btn-map').addEventListener('click', () => {
    const saleItems = products.map(item => ({ 
        ...item, 
        oldPrice: item.price, 
        price: item.price * 0.8 
    }));
    renderCatalog(saleItems);
});

document.getElementById('btn-slice').addEventListener('click', () => {
    const topFour = products.slice(0, 4);
    renderCatalog(topFour);
});

document.getElementById('btn-find').addEventListener('click', () => {
    const flagship = products.find(item => item.price > 3000);
    renderCatalog(flagship ? [flagship] : []);
});

document.getElementById('btn-concat').addEventListener('click', () => {
    const doubled = products.concat(products);
    renderCatalog(doubled);
});

document.getElementById('btn-shift').addEventListener('click', () => {
    workingArray.shift(); 
    renderCatalog(workingArray);
});

document.getElementById('btn-pop').addEventListener('click', () => {
    workingArray.pop(); 
    renderCatalog(workingArray);
});

document.getElementById('btn-splice').addEventListener('click', () => {
    workingArray.splice(0, 3); 
    renderCatalog(workingArray);
});

document.getElementById('btn-reset').addEventListener('click', () => {
    workingArray = [...products];
    renderCatalog(products);
});

const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');


function applyAllFilters() {

    let filtered = [...products];
    const query = searchInput.value.toLowerCase().trim();
    if (query !== '') {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(query));
    }

    const category = categorySelect.value;
    if (category !== 'All') {
        filtered = filtered.filter(item => item.category === category);
    }

    const sortMode = sortSelect.value;
    if (sortMode === 'priceAsc') {
        filtered.sort((a, b) => a.price - b.price); 
    } else if (sortMode === 'priceDesc') {
        filtered.sort((a, b) => b.price - a.price); 
    } else if (sortMode === 'nameAsc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'ratingDesc') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    renderCatalog(filtered);
}

searchInput.addEventListener('input', applyAllFilters);

categorySelect.addEventListener('change', applyAllFilters);
sortSelect.addEventListener('change', applyAllFilters);