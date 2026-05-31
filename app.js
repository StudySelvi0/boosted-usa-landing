// Глобальный файл для интерактивных элементов (Лабораторная №9)

document.addEventListener('DOMContentLoaded', () => {
    // 1. ПРЕЛОАДЕР
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.style.display = 'none', 500);
        }, 800);
    }

    // 2. БУРГЕР МЕНЮ
    const burgerBtn = document.querySelector('.burger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.overlay');

    function toggleMenu() {
        const isActive = burgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('lock-scroll', isActive);
    }

    if (burgerBtn) {
        burgerBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // 3. АНИМАЦИЯ ПРИ СКРОЛЛЕ (Scroll Reaction)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // 4. ПАРАЛЛАКС ЭФФЕКТ
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const bg = document.querySelector('.parallax-bg');
        const mid = document.querySelector('.parallax-mid');
        const heroContent = document.querySelector('.parallax-front');

        if (bg) bg.style.transform = `translateY(${scrolled * 0.3}px)`; // Медленно вниз
        if (mid) mid.style.transform = `translateY(${scrolled * -0.5}px)`; // Быстро вверх (обратное направление)
        if (heroContent) heroContent.style.transform = `translateY(${scrolled * 0.1}px)`; // Немного вниз
    });

    // 5. ГАЛЕРЕЯ МЕДИА СО ЗВУКОМ
    const galleryItems = document.querySelectorAll('.media-item');
    const audioPlayer = new Audio();
    const playIndicator = document.getElementById('play-indicator');
    const volumeControl = document.getElementById('volume-control');

    // Массив из 10 картинок и соответствующих звуков
    const galleryData = [
        { img: 'scateboard.png', sound: 'https://actions.google.com/sounds/v1/transportation/skateboard_roll.ogg' },
        { img: 'scooter.png', sound: 'https://actions.google.com/sounds/v1/transportation/bicycle_bell.ogg' },
        { img: 'helmet.png', sound: 'https://actions.google.com/sounds/v1/impacts/crash_and_glass.ogg' },
        { img: 'photo1.jpg', sound: 'https://actions.google.com/sounds/v1/ambiences/street_traffic.ogg' },
        { img: 'photo2.jpg', sound: 'https://actions.google.com/sounds/v1/transportation/car_passing.ogg' },
        { img: 'photo3.jpg', sound: 'https://actions.google.com/sounds/v1/crowds/crowd_talking_and_laughing.ogg' },
        { img: 'photo4.jpg', sound: 'https://actions.google.com/sounds/v1/weather/wind_fast.ogg' },
        { img: 'photo5.jpg', sound: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
        { img: 'zapchast1.jpg', sound: 'https://actions.google.com/sounds/v1/tools/ratchet_wrench.ogg' },
        { img: 'zapchast2.jpg', sound: 'https://actions.google.com/sounds/v1/doors/wood_door_open_and_close.ogg' }
    ];

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Выбор случайного элемента
            const randomData = galleryData[Math.floor(Math.random() * galleryData.length)];
            
            // Плавная смена картинки
            item.style.opacity = 0;
            setTimeout(() => {
                item.src = randomData.img;
                item.style.opacity = 1;
            }, 300);

            // Воспроизведение звука
            audioPlayer.src = randomData.sound;
            audioPlayer.play();
            if (playIndicator) playIndicator.innerText = "Статус: Играет 🔊";
        });
    });

    audioPlayer.addEventListener('ended', () => {
        if (playIndicator) playIndicator.innerText = "Статус: Пауза ⏸";
    });

    if (volumeControl) {
        volumeControl.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value;
        });
    }

    // 6. ВИДЕО МОДАЛКА
    const videoTrigger = document.getElementById('video-trigger');
    const videoModal = document.getElementById('videoModal');
    if (videoTrigger && videoModal) {
        videoTrigger.addEventListener('click', () => videoModal.classList.add('active'));
        videoModal.querySelector('.modal-close').addEventListener('click', () => {
            videoModal.classList.remove('active');
            // Остановка видео при закрытии
            const iframe = videoModal.querySelector('iframe');
            if (iframe) iframe.src = iframe.src; 
        });
    }

    // Инициализация счетчика из localStorage
    updateCartCounter();
});

// ГЛОБАЛЬНАЯ ФУНКЦИЯ: Всплывающие уведомления (Тосты)
window.showToast = function(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);

    // Анимация появления
    setTimeout(() => toast.classList.add('show'), 10);

    // Удаление через 3 секунды
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// ГЛОБАЛЬНАЯ ФУНКЦИЯ: Анимированный счетчик
window.updateCartCounter = async function() {
    try {
        const res = await fetch('http://localhost:3000/cart');
        const cart = await res.json();
        const counter = document.getElementById('cart-counter');
        if (counter) {
            counter.innerText = cart.length;
            counter.classList.add('bump');
            setTimeout(() => counter.classList.remove('bump'), 300);
        }
    } catch (e) { console.log('Ошибка счетчика', e); }
};