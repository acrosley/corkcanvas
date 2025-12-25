document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('#main-nav .nav-links');

    // Mobile menu (simple drawer)
    function setNavOpen(isOpen) {
        document.body.classList.toggle('nav-open', isOpen);
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
            mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        }
    }

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = document.body.classList.contains('nav-open');
            setNavOpen(!isOpen);
        });

        // Close on link click (mobile)
        navLinks.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a) return;
            setNavOpen(false);
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setNavOpen(false);
        });
    }

    // Guard: this script runs on multiple pages
    if (!galleryGrid || !lightbox || !lightboxImg || !lightboxCaption || !closeLightbox) {
        // Still keep smooth-scroll + section animations below.
    }

    let currentItems = [];
    let currentIndex = -1;
    const PAGE_SIZE = 24;
    let renderedCount = 0;

    function populateGallery(filter = 'all') {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        renderedCount = 0;

        const filteredData = filter === 'all'
            ? (window.galleryData || [])
            : (window.galleryData || []).filter(item => item.category === filter);

        currentItems = filteredData;
        currentIndex = -1;

        const slice = filteredData.slice(0, PAGE_SIZE);
        slice.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'gallery-item fade-in';
            div.style.animationDelay = (index % 10) * 0.1 + 's';
            div.innerHTML = `
                <img src="${item.src}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    <h4>${item.title}</h4>
                </div>
            `;
            div.addEventListener('click', () => openLightboxByIndex(index));
            galleryGrid.appendChild(div);
        });

        renderedCount = slice.length;

        // "Load more" button for performance
        if (filteredData.length > renderedCount) {
            const loadMore = document.createElement('button');
            loadMore.className = 'btn btn-secondary';
            loadMore.type = 'button';
            loadMore.style.margin = '60px auto 0';
            loadMore.style.display = 'block';
            loadMore.textContent = 'Load more';
            loadMore.addEventListener('click', () => {
                renderMore();
                if (renderedCount >= currentItems.length) loadMore.remove();
            });
            galleryGrid.parentElement.appendChild(loadMore);
        }
    }

    function renderMore() {
        if (!galleryGrid) return;
        const next = currentItems.slice(renderedCount, renderedCount + PAGE_SIZE);
        next.forEach((item, i) => {
            const index = renderedCount + i;
            const div = document.createElement('div');
            div.className = 'gallery-item fade-in';
            div.style.animationDelay = (index % 10) * 0.05 + 's';
            div.innerHTML = `
                <img src="${item.src}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    <h4>${item.title}</h4>
                </div>
            `;
            div.addEventListener('click', () => openLightboxByIndex(index));
            galleryGrid.appendChild(div);
        });
        renderedCount += next.length;
    }

    // Lightbox Logic
    function openLightboxByIndex(index) {
        if (!currentItems[index]) return;
        currentIndex = index;
        const item = currentItems[index];
        lightboxImg.src = item.src;
        lightboxCaption.textContent = item.title;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else if (e.key === 'ArrowRight') {
            if (currentIndex >= 0) openLightboxByIndex(Math.min(currentIndex + 1, currentItems.length - 1));
        } else if (e.key === 'ArrowLeft') {
            if (currentIndex >= 0) openLightboxByIndex(Math.max(currentIndex - 1, 0));
        }
    });

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Remove any existing "Load more" button (it lives next to gallery grid)
            const existingLoadMore = galleryGrid?.parentElement?.querySelector('.btn.btn-secondary');
            if (existingLoadMore && existingLoadMore.textContent?.toLowerCase().includes('load more')) {
                existingLoadMore.remove();
            }
            populateGallery(btn.dataset.filter);
        });
    });

    // Initial Load
    populateGallery();

    // Form Submission (Mock)
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your inquiry! We will get back to you within 24 hours.');
            orderForm.reset();
        });
    }

    // Smooth Scroll for Nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});
