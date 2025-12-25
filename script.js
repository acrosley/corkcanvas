const galleryData = [
    { src: 'bottles/ccc-logo-bottle.JPG', category: 'all', title: 'Signature Logo Bottle' },
    { src: 'bottles/birthdays/bottle (1).JPG', category: 'birthdays', title: '60th Birthday Celebration' },
    { src: 'bottles/colleges/bottle (100).JPG', category: 'colleges', title: 'Ole Miss Custom' },
    { src: 'bottles/colleges/bottle (2).JPG', category: 'colleges', title: 'University Theme' },
    { src: 'bottles/birthdays/bottle (10).JPG', category: 'birthdays', title: 'Birthday Floral' },
    { src: 'recent-posts.png', category: 'all', title: 'Recent Creations' },
];

document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Populate Gallery
    function populateGallery(filter = 'all') {
        galleryGrid.innerHTML = '';
        const filteredData = filter === 'all'
            ? galleryData
            : galleryData.filter(item => item.category === filter);

        filteredData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'gallery-item fade-in';
            div.innerHTML = `
                <img src="${item.src}" alt="${item.title}">
                <div class="gallery-overlay">
                    <h4>${item.title}</h4>
                </div>
            `;
            galleryGrid.appendChild(div);
        });
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            populateGallery(btn.dataset.filter);
        });
    });

    // Initial Load
    populateGallery();

    // Form Submission (Mock)
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your inquiry! We will get back to you within 24 hours.');
        orderForm.reset();
    });

    // Smooth Scroll for Nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
