document.addEventListener('DOMContentLoaded', () => {
    // 1. Monograma de píxeles: se dibuja píxel a píxel a partir de un mapa de bits
    const mark = document.getElementById('pixel-mark');
    const bitmap = [
        'DDDD..BBBB.',
        'D...D.B...B',
        'D...D.B...B',
        'D...D.BBBB.',
        'D...D.B...B',
        'D...D.B...B',
        'DDDD..BBBB.'
    ];

    if (mark) {
        const svgNS = 'http://www.w3.org/2000/svg';
        let i = 0;
        bitmap.forEach((row, y) => {
            [...row].forEach((cell, x) => {
                if (cell === '.') return;
                const rect = document.createElementNS(svgNS, 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                // Un pelín más de 1 para que no se vean juntas entre píxeles al escalar
                rect.setAttribute('width', 1.04);
                rect.setAttribute('height', 1.04);
                rect.setAttribute('class', cell === 'D' ? 'px-d' : 'px-b');
                rect.style.setProperty('--i', i++);
                mark.appendChild(rect);
            });
        });
    }

    // 2. Texto rotativo con efecto de escritura
    const rotator = document.getElementById('rotator');
    const words = [
        'Full-Stack Developer',
        'Especialista en PHP & JavaScript',
        'WordPress y WooCommerce a medida',
        '10+ años creando soluciones web'
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (rotator && !reduceMotion) {
        let wordIndex = 0;
        let charIndex = words[0].length;
        let isDeleting = true;

        function type() {
            const word = words[wordIndex];
            charIndex += isDeleting ? -1 : 1;
            rotator.textContent = word.substring(0, charIndex);

            let delay = isDeleting ? 40 : 90;
            if (!isDeleting && charIndex === word.length) {
                delay = 2200;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                delay = 400;
            }
            setTimeout(type, delay);
        }

        setTimeout(type, 2600);
    }

    // 3. Borde de la cabecera al hacer scroll
    const header = document.getElementById('site-header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 4. Menú móvil
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('site-nav');

    if (toggle && nav) {
        const setOpen = (open) => {
            nav.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        };

        toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
        nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    }

    // 5. Formulario de contacto (Formspree)
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    if (form && status) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.className = 'form-status';
            status.textContent = 'Enviando…';

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });

                if (response.ok) {
                    status.className = 'form-status is-ok';
                    status.textContent = 'Mensaje enviado. Te respondo pronto.';
                    form.reset();
                } else {
                    const data = await response.json().catch(() => ({}));
                    status.className = 'form-status is-error';
                    status.textContent = data.errors
                        ? data.errors.map((err) => err.message).join(', ')
                        : 'No se ha podido enviar. Inténtalo de nuevo.';
                }
            } catch (error) {
                status.className = 'form-status is-error';
                status.textContent = 'Sin conexión. Revisa tu red e inténtalo de nuevo.';
            }
        });
    }
});
