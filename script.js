// ============================================================
//  Carousel helper
// ============================================================
function initCarousel({ trackId, prevId, nextId, visibleCount, dotsContainerId }) {
    const track    = document.getElementById(trackId);
    const prevBtn  = document.getElementById(prevId);
    const nextBtn  = document.getElementById(nextId);
    const dotsWrap = dotsContainerId ? document.getElementById(dotsContainerId) : null;

    if (!track || !prevBtn || !nextBtn) return;

    const items   = Array.from(track.children);
    const total   = items.length;
    let   current = 0;

    function getItemWidth() {
        if (!items[0]) return 0;
        const style = window.getComputedStyle(track);
        const gap   = parseFloat(style.gap) || 10;
        return items[0].getBoundingClientRect().width + gap;
    }

    function maxIndex() {
        return Math.max(0, total - visibleCount);
    }

    function goTo(index) {
        current = Math.max(0, Math.min(index, maxIndex()));
        track.style.transform = `translateX(-${current * getItemWidth()}px)`;

        prevBtn.disabled = current === 0;
        nextBtn.disabled = current >= maxIndex();

        if (dotsWrap) {
            const pageCount = Math.ceil(total / visibleCount);
            const activePage = Math.floor(current / visibleCount);
            dotsWrap.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === activePage);
            });
        }
    }

    // Build dots dynamically based on page count
    if (dotsWrap) {
        const pageCount = Math.ceil(total / visibleCount);
        dotsWrap.innerHTML = '';
        for (let i = 0; i < pageCount; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goTo(i * visibleCount));
            dotsWrap.appendChild(dot);
        }
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Initial state
    goTo(0);

    // Recalculate on resize
    window.addEventListener('resize', () => goTo(current));
}

// ============================================================
//  Initialise carousels on DOMContentLoaded
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Gallery carousel — shows 5 items at a time
    initCarousel({
        trackId:          'gallery-track',
        prevId:           'gallery-prev',
        nextId:           'gallery-next',
        visibleCount:     5,
        dotsContainerId:  'gallery-dots'
    });

    // Products carousel — shows 7 items at a time
    initCarousel({
        trackId:      'products-track',
        prevId:       'products-prev',
        nextId:       'products-next',
        visibleCount: 7
    });

    // -------------------------------------------------------
    //  Hero carousel (auto-advance every 5s)
    // -------------------------------------------------------
    const heroSlideEls = Array.from(document.querySelectorAll('.hero-slide'));
    const heroDotEls   = Array.from(document.querySelectorAll('.hero-dot'));
    let heroIdx   = 0;
    let heroTimer = null;

    if (heroSlideEls.length) {
        heroSlideEls[0].classList.add('active');

        function goHeroSlide(n) {
            heroSlideEls[heroIdx].classList.remove('active');
            heroDotEls[heroIdx].classList.remove('active');
            heroIdx = (n + heroSlideEls.length) % heroSlideEls.length;
            heroSlideEls[heroIdx].classList.add('active');
            heroDotEls[heroIdx].classList.add('active');
        }

        function startHeroTimer() {
            heroTimer = setInterval(() => goHeroSlide(heroIdx + 1), 5000);
        }

        heroDotEls.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                clearInterval(heroTimer);
                goHeroSlide(i);
                startHeroTimer();
            });
        });

        startHeroTimer();
    }

    // Hero CTA buttons → trigger nav items
    const heroBtnRemeras = document.getElementById('hero-btn-remeras');
    const heroBtnBuzos   = document.getElementById('hero-btn-buzos');

    if (heroBtnRemeras) {
        heroBtnRemeras.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.textContent.trim().toUpperCase() === 'REMERAS') item.click();
            });
        });
    }

    if (heroBtnBuzos) {
        heroBtnBuzos.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.textContent.trim().toUpperCase() === 'BUZOS') item.click();
            });
        });
    }

    // -------------------------------------------------------
    //  Scroll-reveal (IntersectionObserver)
    // -------------------------------------------------------
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealEls.length) {
        const revealObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealEls.forEach(el => revealObs.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('revealed'));
    }

    // -------------------------------------------------------
    //  Nav switching
    // -------------------------------------------------------
    const homeView     = document.getElementById('home-view');
    const designerView = document.getElementById('designer-view');
    const typeLabel    = document.getElementById('designer-type-label');
    const svgRemera    = document.getElementById('svg-remera');
    const svgBuzo      = document.getElementById('svg-buzo');
    const garmentHint  = document.getElementById('garment-hint');

    // Nav items that open the designer
    const DESIGNER_ITEMS = { 'REMERAS': 'remera', 'BUZOS': 'buzo' };

    // State shared with checkout
    let currentGarmentType = 'remera';
    let currentColorHex    = '#2a2a2a';
    let currentColorName   = 'Negro';
    const PRICES = { remera: 2400, buzo: 4200 };
    const COLOR_NAMES = {
        '#2a2a2a': 'Negro',      '#ffffff': 'Blanco',
        '#1a3a5c': 'Azul marino','#7c0a02': 'Rojo oscuro',
        '#2d5a27': 'Verde oscuro','#c9a028': 'Dorado',
        '#4a4a4a': 'Gris',       '#3b1f5e': 'Violeta',
    };

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const label = this.textContent.trim().toUpperCase();
            // Sync active state across sidebar + mobile drawer
            document.querySelectorAll('.nav-item').forEach(n => {
                n.classList.toggle('active', n.textContent.trim().toUpperCase() === label);
            });

            // Close mobile drawer if open
            const drawer  = document.getElementById('mobile-drawer');
            const hambBtn = document.getElementById('hamburger-btn');
            if (drawer && drawer.classList.contains('open')) {
                drawer.classList.remove('open');
                hambBtn.classList.remove('active');
                hambBtn.setAttribute('aria-expanded', 'false');
            }

            if (DESIGNER_ITEMS[label]) {
                openDesigner(DESIGNER_ITEMS[label], label);
            } else {
                closeDesigner();
            }
        });
    });

    function openDesigner(type, displayLabel) {
        currentGarmentType = type;
        homeView.classList.add('hidden');
        designerView.classList.remove('hidden');
        typeLabel.textContent = displayLabel;

        if (type === 'buzo') {
            svgRemera.classList.add('hidden');
            svgBuzo.classList.remove('hidden');
        } else {
            svgBuzo.classList.add('hidden');
            svgRemera.classList.remove('hidden');
        }
    }

    function closeDesigner() {
        designerView.classList.add('hidden');
        homeView.classList.remove('hidden');
    }

    // -------------------------------------------------------
    //  Designer: upload, drag, resize, color
    // -------------------------------------------------------
    const stage          = document.getElementById('garment-stage');
    const uploadInput    = document.getElementById('design-upload');
    const uploadZone     = document.getElementById('upload-zone');
    const btnUpload      = document.getElementById('btn-upload-trigger');
    const uploadedLabel  = document.getElementById('uploaded-filename');
    const filenameText   = document.getElementById('filename-text');
    const sizeSlider     = document.getElementById('design-size');
    const opacitySlider  = document.getElementById('design-opacity');
    const sizeControl    = document.getElementById('size-control');
    const opacityControl = document.getElementById('opacity-control');
    const btnReset       = document.getElementById('btn-reset');
    const swatches       = document.querySelectorAll('.swatch');

    let overlay = null;  // the <img> element
    let overlayX = 0, overlayY = 0;  // position in px relative to stage

    // Trigger file picker
    btnUpload.addEventListener('click', () => uploadInput.click());
    uploadZone.addEventListener('click', (e) => {
        if (e.target !== btnUpload) uploadInput.click();
    });

    // Drag-over styling
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadDesignFile(file);
    });

    uploadInput.addEventListener('change', () => {
        if (uploadInput.files[0]) loadDesignFile(uploadInput.files[0]);
    });

    function loadDesignFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            placeOverlay(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    function placeOverlay(src, name) {
        // Remove existing overlay
        if (overlay) overlay.remove();

        overlay = document.createElement('img');
        overlay.id = 'design-overlay';
        overlay.src = src;
        overlay.draggable = false;
        overlay.alt = 'diseño';

        // Initial size: 100px wide, centred on chest area
        const stageRect = stage.getBoundingClientRect();
        const initialW  = 100;
        overlayX = (stageRect.width  - initialW) / 2;
        overlayY = stageRect.height * 0.28;

        applyOverlayTransform(initialW);
        stage.appendChild(overlay);

        // Show controls
        filenameText.textContent = name;
        uploadedLabel.classList.remove('hidden');
        sizeControl.style.display    = 'flex';
        opacityControl.style.display = 'flex';
        btnReset.classList.remove('hidden');
        garmentHint.style.opacity = '1';

        // Reset sliders
        sizeSlider.value    = 100;
        opacitySlider.value = 100;

        enableDrag(overlay);
    }

    function applyOverlayTransform(width) {
        if (!overlay) return;
        const w = width || parseInt(sizeSlider.value) + 40;
        overlay.style.width    = w + 'px';
        overlay.style.left     = overlayX + 'px';
        overlay.style.top      = overlayY + 'px';
        overlay.style.opacity  = opacitySlider.value / 100;
    }

    // Size slider
    sizeSlider.addEventListener('input', () => {
        if (!overlay) return;
        const w = parseInt(sizeSlider.value) + 40;
        overlay.style.width = w + 'px';
        // Re-centre if needed (keep current position)
        overlay.style.left = overlayX + 'px';
        overlay.style.top  = overlayY + 'px';
    });

    // Opacity slider
    opacitySlider.addEventListener('input', () => {
        if (!overlay) return;
        overlay.style.opacity = opacitySlider.value / 100;
    });

    // Color swatches
    swatches.forEach(sw => {
        sw.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            const color = sw.dataset.color;
            currentColorHex  = color;
            currentColorName = COLOR_NAMES[color] || color;
            document.querySelectorAll('.garment-body').forEach(el => el.setAttribute('fill', color));
            // Adjust stroke brightness for light colours
            const isLight = color === '#ffffff';
            document.querySelectorAll('.garment-body').forEach(el =>
                el.setAttribute('stroke', isLight ? '#bbb' : '#444')
            );
        });
    });

    // Reset
    btnReset.addEventListener('click', () => {
        if (overlay) { overlay.remove(); overlay = null; }
        uploadInput.value       = '';
        uploadedLabel.classList.add('hidden');
        sizeControl.style.display    = 'none';
        opacityControl.style.display = 'none';
        btnReset.classList.add('hidden');
        garmentHint.style.opacity = '0';
    });

    // -------------------------------------------------------
    //  Drag logic (pointer events)
    // -------------------------------------------------------
    function enableDrag(el) {
        let startX, startY, startLeft, startTop;
        let isDragging = false;

        el.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            el.setPointerCapture(e.pointerId);
            isDragging = true;
            el.classList.add('dragging');

            startX    = e.clientX;
            startY    = e.clientY;
            startLeft = overlayX;
            startTop  = overlayY;
        });

        el.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const stageRect = stage.getBoundingClientRect();
            const imgW = el.offsetWidth;
            const imgH = el.offsetHeight;

            // Clamp within stage bounds
            overlayX = Math.max(0, Math.min(startLeft + dx, stageRect.width  - imgW));
            overlayY = Math.max(0, Math.min(startTop  + dy, stageRect.height - imgH));

            el.style.left = overlayX + 'px';
            el.style.top  = overlayY + 'px';
        });

        el.addEventListener('pointerup', () => {
            isDragging = false;
            el.classList.remove('dragging');
        });

        el.addEventListener('pointercancel', () => {
            isDragging = false;
            el.classList.remove('dragging');
        });
    }

    // Hide hint initially
    garmentHint.style.opacity = '0';

    // -------------------------------------------------------
    //  Hamburger menu (mobile)
    // -------------------------------------------------------
    const hamburgerBtn  = document.getElementById('hamburger-btn');
    const mobileDrawer  = document.getElementById('mobile-drawer');

    if (hamburgerBtn && mobileDrawer) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            hamburgerBtn.classList.toggle('active', isOpen);
            hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (
                mobileDrawer.classList.contains('open') &&
                !mobileDrawer.contains(e.target) &&
                !hamburgerBtn.contains(e.target)
            ) {
                mobileDrawer.classList.remove('open');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // -------------------------------------------------------
    //  Checkout modal
    // -------------------------------------------------------
    const modal             = document.getElementById('checkout-modal');
    const formStep          = document.getElementById('checkout-form-step');
    const successStep       = document.getElementById('checkout-success-step');
    const checkoutForm      = document.getElementById('checkout-form');
    const modalCloseBtn     = document.getElementById('modal-close');
    const btnCheckoutCancel = document.getElementById('btn-checkout-cancel');
    const btnSuccessClose   = document.getElementById('btn-success-close');
    const chProductName     = document.getElementById('checkout-product-name');
    const chColorDot        = document.getElementById('checkout-color-dot');
    const chColorNameEl     = document.getElementById('checkout-color-name');
    const chUnitPrice       = document.getElementById('checkout-unit-price');
    const chTotal           = document.getElementById('checkout-total');
    const chSuccessId       = document.getElementById('success-order-id');
    const chSuccessEmail    = document.getElementById('success-email');
    const qtyValueEl        = document.getElementById('qty-value');
    const qtyMinus          = document.getElementById('qty-minus');
    const qtyPlus           = document.getElementById('qty-plus');
    const sizeChipEls       = document.querySelectorAll('.size-chip');

    let checkoutQty  = 1;
    let selectedSize = 'M';

    function fmtPrice(n) {
        return '$' + n.toLocaleString('es-AR');
    }

    function updateCheckoutTotal() {
        chTotal.textContent = fmtPrice(PRICES[currentGarmentType] * checkoutQty);
    }

    // Open modal on "Agregar al carrito"
    document.getElementById('btn-order').addEventListener('click', () => {
        chProductName.textContent   = currentGarmentType === 'buzo' ? 'Buzo personalizado' : 'Remera personalizada';
        chColorDot.style.background = currentColorHex;
        chColorNameEl.textContent   = currentColorName;
        chUnitPrice.textContent     = fmtPrice(PRICES[currentGarmentType]) + ' / u';
        checkoutQty  = 1;
        selectedSize = 'M';
        qtyValueEl.textContent = '1';
        sizeChipEls.forEach(c => c.classList.toggle('active', c.dataset.size === 'M'));
        checkoutForm.reset();
        ['ch-name', 'ch-email'].forEach(id => document.getElementById(id).classList.remove('input-error'));
        updateCheckoutTotal();
        formStep.classList.remove('hidden');
        successStep.classList.add('hidden');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    // Quantity controls
    qtyMinus.addEventListener('click', () => {
        if (checkoutQty > 1) { checkoutQty--; qtyValueEl.textContent = checkoutQty; updateCheckoutTotal(); }
    });
    qtyPlus.addEventListener('click', () => {
        if (checkoutQty < 99) { checkoutQty++; qtyValueEl.textContent = checkoutQty; updateCheckoutTotal(); }
    });

    // Size chips
    sizeChipEls.forEach(chip => {
        chip.addEventListener('click', () => {
            sizeChipEls.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedSize = chip.dataset.size;
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    modalCloseBtn.addEventListener('click', closeModal);
    btnCheckoutCancel.addEventListener('click', closeModal);
    btnSuccessClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Form submit → save order to localStorage
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name  = document.getElementById('ch-name').value.trim();
        const email = document.getElementById('ch-email').value.trim();
        let valid = true;
        if (!name) { document.getElementById('ch-name').classList.add('input-error'); valid = false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('ch-email').classList.add('input-error'); valid = false;
        }
        if (!valid) return;

        const stored = JSON.parse(localStorage.getItem('eventos_orders') || '[]');
        const maxNum = stored.reduce((mx, o) => {
            const n = parseInt((o.id || '').replace('EVT-', ''), 10);
            return isNaN(n) ? mx : Math.max(mx, n);
        }, 6);
        const orderId = 'EVT-' + String(maxNum + 1).padStart(4, '0');

        const newOrder = {
            id:        orderId,
            date:      new Date().toISOString().split('T')[0],
            customer:  name,
            email:     email,
            product:   currentGarmentType === 'buzo' ? 'Buzo' : 'Remera',
            colorHex:  currentColorHex,
            colorName: currentColorName,
            size:      selectedSize,
            qty:       checkoutQty,
            notes:     document.getElementById('ch-notes').value.trim(),
            status:    'pendiente',
            total:     PRICES[currentGarmentType] * checkoutQty,
        };
        stored.unshift(newOrder);
        localStorage.setItem('eventos_orders', JSON.stringify(stored));

        chSuccessId.textContent    = 'Pedido ' + orderId;
        chSuccessEmail.textContent = email;
        formStep.classList.add('hidden');
        successStep.classList.remove('hidden');
    });

    // Remove error state on input
    ['ch-name', 'ch-email'].forEach(id => {
        document.getElementById(id).addEventListener('input', function () {
            this.classList.remove('input-error');
        });
    });
});
