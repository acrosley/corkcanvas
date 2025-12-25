document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('interactive-order-form');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    const progressBar = document.getElementById('progress');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');

    let currentStep = 1;

    // --- Navigation Logic ---
    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep - 1);
        });

        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep - 1);
            step.classList.toggle('completed', index < currentStep - 1);
        });

        const progressWidth = ((currentStep - 1) / (progressSteps.length - 1)) * 100;
        progressBar.style.width = `${progressWidth}%`;

        prevBtn.disabled = currentStep === 1;

        if (currentStep === steps.length) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }

        calculateTotal();
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < steps.length) {
            currentStep++;
            updateStep();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    // --- Item Type Toggle ---
    const itemTypeInputs = document.querySelectorAll('input[name="item-type"]');
    const bottleOptions = document.getElementById('bottle-options');
    const bannerOptions = document.getElementById('banner-options');
    const step2Title = document.getElementById('step-2-title');

    itemTypeInputs.forEach(input => {
        input.addEventListener('change', () => {
            const isBottle = input.value === 'bottle';
            bottleOptions.classList.toggle('hidden', !isBottle);
            bannerOptions.classList.toggle('hidden', isBottle);
            step2Title.textContent = isBottle ? 'Step 2: Select your bottle' : 'Step 2: Select your banner size';
            calculateTotal();
        });
    });

    // --- Price Calculation Logic ---
    function calculateTotal() {
        let total = 0;
        const summaryAddons = document.getElementById('summary-addons');
        summaryAddons.innerHTML = '';

        // 1. Base Item
        const itemType = document.querySelector('input[name="item-type"]:checked').value;
        let basePrice = 0;
        let baseName = "";

        if (itemType === 'bottle') {
            const selectedBottle = document.querySelector('input[name="bottle-choice"]:checked');
            basePrice = parseInt(selectedBottle.dataset.price);
            baseName = selectedBottle.parentElement.querySelector('h3').textContent;
        } else {
            const selectedBanner = document.querySelector('input[name="banner-choice"]:checked');
            if (selectedBanner) {
                basePrice = parseInt(selectedBanner.dataset.price);
                baseName = selectedBanner.parentElement.querySelector('h3').textContent;
            }
        }

        total += basePrice;
        document.getElementById('summary-base-price').textContent = `$${basePrice}`;

        // 2. Add-ons
        const addons = document.querySelectorAll('input[name="addon"]:checked');
        addons.forEach(addon => {
            const price = parseInt(addon.dataset.price);
            const name = addon.parentElement.querySelector('h3').textContent;
            total += price;

            const div = document.createElement('div');
            div.className = 'summary-item';
            div.innerHTML = `<span>${name}</span><span>+$${price}</span>`;
            summaryAddons.appendChild(div);
        });

        // 3. Rush Fee
        const turnaround = document.getElementById('turnaround-select');
        const rushPrice = parseInt(turnaround.options[turnaround.selectedIndex].dataset.price);
        total += rushPrice;
        document.getElementById('summary-rush-price').textContent = `+$${rushPrice}`;
        document.getElementById('summary-rush-item').classList.toggle('hidden', rushPrice === 0);

        // 4. Shipping
        const shippingCheckbox = document.getElementById('shipping-checkbox');
        const shippingPrice = shippingCheckbox.checked ? parseInt(shippingCheckbox.dataset.price) : 0;
        total += shippingPrice;
        document.getElementById('summary-shipping-price').textContent = `+$${shippingPrice}`;
        document.getElementById('summary-shipping-item').classList.toggle('hidden', !shippingCheckbox.checked);

        // Update Total
        document.getElementById('total-price').textContent = `$${total}`;
    }

    // Listen for any changes in the form
    form.addEventListener('change', calculateTotal);

    // Initial calculation
    calculateTotal();

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Static-site friendly submission: open a pre-filled email draft (works on Render without a backend).
        // TODO: replace this with your real business email address.
        const TO_EMAIL = 'corkcanvas@example.com';

        const itemType = document.querySelector('input[name="item-type"]:checked')?.value || 'bottle';
        const base = itemType === 'bottle'
            ? document.querySelector('input[name="bottle-choice"]:checked')
            : document.querySelector('input[name="banner-choice"]:checked');

        const baseName = base?.parentElement?.querySelector('h3')?.textContent?.trim() || 'Base item';
        const basePrice = base?.dataset?.price ? parseInt(base.dataset.price) : 0;

        const addons = Array.from(document.querySelectorAll('input[name="addon"]:checked')).map((addon) => ({
            name: addon.parentElement.querySelector('h3')?.textContent?.trim() || 'Add-on',
            price: addon.dataset.price ? parseInt(addon.dataset.price) : 0,
        }));

        const turnaroundSelect = document.getElementById('turnaround-select');
        const rushOption = turnaroundSelect?.options?.[turnaroundSelect.selectedIndex];
        const rushLabel = rushOption?.textContent?.trim() || 'Standard (2-3 Weeks)';
        const rushPrice = rushOption?.dataset?.price ? parseInt(rushOption.dataset.price) : 0;

        const shippingCheckbox = document.getElementById('shipping-checkbox');
        const shippingNeeded = Boolean(shippingCheckbox?.checked);
        const shippingPrice = shippingNeeded ? (shippingCheckbox?.dataset?.price ? parseInt(shippingCheckbox.dataset.price) : 0) : 0;

        const vision = form.querySelector('textarea[name="vision"]')?.value?.trim() || '';
        const name = form.querySelector('input[name="name"]')?.value?.trim() || '';
        const email = form.querySelector('input[name="email"]')?.value?.trim() || '';

        const totalEstimate = basePrice
            + addons.reduce((sum, a) => sum + a.price, 0)
            + rushPrice
            + shippingPrice;

        const lines = [
            'New Cork & Canvas Order Inquiry',
            '',
            `Name: ${name}`,
            `Email: ${email}`,
            '',
            `Item Type: ${itemType}`,
            `Base: ${baseName} ($${basePrice})`,
            addons.length ? 'Add-ons:' : 'Add-ons: None',
            ...addons.map(a => `- ${a.name} (+$${a.price})`),
            `Turnaround: ${rushLabel}`,
            rushPrice ? `Rush Fee: +$${rushPrice}` : 'Rush Fee: $0',
            shippingNeeded ? `Shipping: Yes (+$${shippingPrice})` : 'Shipping: No',
            '',
            `Total Estimate: $${totalEstimate}`,
            '',
            'Vision / Notes:',
            vision || '(none provided)',
        ];

        const subject = encodeURIComponent('Cork & Canvas Order Inquiry');
        const body = encodeURIComponent(lines.join('\n'));
        window.location.href = `mailto:${encodeURIComponent(TO_EMAIL)}?subject=${subject}&body=${body}`;
    });
});
