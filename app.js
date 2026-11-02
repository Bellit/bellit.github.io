document.addEventListener('DOMContentLoaded', () => {
    // 1. Monograma de píxeles: cada letra es una sola forma a partir de un mapa de bits, sin juntas al escalar
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
        ['D', 'B'].forEach((letter, i) => {
            let d = '';
            bitmap.forEach((row, y) => {
                [...row].forEach((cell, x) => {
                    if (cell === letter) d += `M${x} ${y}h1v1h-1z`;
                });
            });
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', d);
            path.setAttribute('class', letter === 'D' ? 'px-d' : 'px-b');
            path.style.setProperty('--i', i);
            mark.appendChild(path);
        });
    }

    // 2. Texto rotativo con efecto de escritura
    const rotator = document.getElementById('rotator');
    const words = [
        'Webs en WordPress',
        'Tiendas con WooCommerce',
        'Automatizaciones con IA',
        'Herramientas a medida',
        'Rescate de webs heredadas'
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (rotator && !reduceMotion) {
        let wordIndex = 0;
        let charIndex = words[0].length;
        let isDeleting = true;
        let rotatorTimer;

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
                document.dispatchEvent(new CustomEvent('rotator:change', { detail: wordIndex }));
                delay = 400;
            }
            rotatorTimer = setTimeout(type, delay);
        }

        rotatorTimer = setTimeout(type, 2600);

        // Los marcadores saltan directamente a un tipo de proyecto
        document.querySelectorAll('.hero-tick').forEach((tick, index) => {
            tick.addEventListener('click', () => {
                clearTimeout(rotatorTimer);
                wordIndex = index;
                charIndex = 0;
                isDeleting = false;
                rotator.textContent = '';
                document.dispatchEvent(new CustomEvent('rotator:change', { detail: index }));
                rotatorTimer = setTimeout(type, 400);
            });
        });
    } else if (rotator) {
        document.querySelectorAll('.hero-tick').forEach((tick, index) => {
            tick.addEventListener('click', () => {
                rotator.textContent = words[index];
                document.dispatchEvent(new CustomEvent('rotator:change', { detail: index }));
            });
        });
    }

    // 2b. Escenario de la portada: las mismas 14 piezas se reordenan según el rótulo.
    // Cada pieza es [x, y, ancho, alto, tono, giro] sobre una retícula de 40 × 30.
    const stage = document.getElementById('hero-stage');

    if (stage) {
        const layouts = [
            // Web
            [[2, 2, 3, 2, 'a'], [24, 2.5, 3, 1], [28.5, 2.5, 3, 1], [33, 2.5, 5, 1], [2, 8, 18, 2.5, 'w'],
                [2, 11.5, 13, 2.5, 'w'], [2, 15.5, 16, 1], [2, 19.5, 7, 2.5, 'h'], [22, 7, 16, 15, 'a'],
                [2, 24.5, 11, 3.5], [14.5, 24.5, 11, 3.5], [27, 24.5, 11, 3.5], [2, 17.3, 12, 1], [30, 14, 0, 0]],
            // Tienda
            [[2, 2, 3, 2, 'a'], [14.5, 15.5, 7, 1], [27, 15.5, 7, 1], [14.5, 27, 7, 1], [2, 18.5, 11, 8],
                [14.5, 18.5, 11, 8, 'a'], [2, 15.5, 7, 1], [34, 1.5, 4, 3, 'h'], [2, 7, 11, 8, 'a'],
                [14.5, 7, 11, 8], [27, 7, 11, 8], [27, 18.5, 11, 8], [2, 27, 7, 1], [27, 27, 7, 1]],
            // Automatización
            [[20, 15, 0, 0], [11, 7, 5, 0.3], [11, 15, 5.5, 0.3], [25, 15, 5, 0.3], [18.5, 13, 5, 1, 'w'],
                [18.5, 15.5, 5, 1, 'w'], [16, 7, 0.2, 16.3], [30, 10, 8, 10.3, 'h'], [16.5, 10, 8.5, 10.3, 'a'],
                [2, 5, 9, 4], [2, 13, 9, 4], [2, 21, 9, 4], [11, 23, 5, 0.3], [20, 15, 0, 0]],
            // Herramienta
            [[2, 7, 8.5, 6.5], [11.25, 7, 8.5, 6.5], [20.5, 7, 8.5, 6.5], [29.75, 7, 8.25, 6.5], [2, 2, 14, 2.5, 'w'],
                [32, 2, 6, 2.5], [2, 14.5, 8.5, 6.5], [20.5, 14.5, 8.5, 6.5, 'h'], [11.25, 14.5, 8.5, 6.5, 'a'],
                [29.75, 14.5, 8.25, 6.5], [2, 22, 8.5, 6.5], [11.25, 22, 8.5, 6.5], [20.5, 22, 8.5, 6.5, 'a'],
                [29.75, 22, 8.25, 6.5]],
            // Web heredada: la misma web de antes, descolocada, a la espera de que el siguiente paso la ordene
            [[3, 3, 3, 2, 'n', -8], [21, 4, 3, 1, 'n', 6], [29.5, 1.5, 3, 1, 'n', -5], [31, 5, 5, 1, 'n', 7],
                [4, 9, 18, 2.5, 'n', 3], [1, 13, 13, 2.5, 'n', -4], [5, 17, 16, 1, 'n', 5], [10, 20, 7, 2.5, 'n', -7],
                [23, 9, 14, 12, 'n', 4], [3, 24, 11, 3.5, 'n', -3], [15, 23, 11, 3.5, 'n', 4], [26, 25, 11, 3.5, 'n', -2],
                [1, 19, 12, 1, 'n', 6], [30, 14, 0, 0]]
        ];

        const pieces = layouts[0].map((_, n) => {
            const piece = document.createElement('i');
            piece.style.setProperty('--n', n);
            stage.appendChild(piece);
            return piece;
        });

        const ticks = document.querySelectorAll('.hero-tick');

        const show = (index) => {
            ticks.forEach((tick, i) => {
                if (i === index) tick.setAttribute('aria-current', 'true');
                else tick.removeAttribute('aria-current');
            });
            layouts[index].forEach(([x, y, w, h, tone = 'n', turn = 0], n) => {
                pieces[n].className = `t-${tone}`;
                pieces[n].style.transform =
                    `translate(${(x / 40) * 100}%, ${(y / 30) * 100}%) rotate(${turn}deg) scale(${w / 40}, ${h / 30})`;
            });
        };

        document.addEventListener('rotator:change', (e) => show(e.detail));
        // Si la pestaña carga en segundo plano, el rótulo puede avanzar antes de esta primera composición
        let started = false;
        document.addEventListener('rotator:change', () => { started = true; }, { once: true });
        requestAnimationFrame(() => requestAnimationFrame(() => { if (!started) show(0); }));
    }

    // 3. IA: los carriles del esquema se dibujan al llegar a ellos (sin JS se ven completos)
    const aiFlow = document.getElementById('ai-flow');

    if (aiFlow && !reduceMotion && 'IntersectionObserver' in window) {
        aiFlow.classList.add('is-waiting');
        const aiFlowObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                aiFlow.classList.remove('is-waiting');
                aiFlowObserver.disconnect();
            }
        }, { threshold: 0.3 });
        aiFlowObserver.observe(aiFlow);
    }

    const aiIdeasCta = document.querySelector('.ai-ideas-cta');

    if (aiIdeasCta) {
        aiIdeasCta.addEventListener('click', () => {
            const projectType = document.getElementById('project-type');
            if (projectType) projectType.value = aiIdeasCta.dataset.project;
        });
    }

    // 3b. Los pasos del proceso se completan al llegar a ellos (sin JS se ven completos)
    const steps = document.getElementById('steps');

    if (steps && !reduceMotion && 'IntersectionObserver' in window) {
        steps.classList.add('is-waiting');
        const stepsObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                steps.classList.remove('is-waiting');
                stepsObserver.disconnect();
            }
        }, { threshold: 0.4 });
        stepsObserver.observe(steps);
    }

    // 3c. Servicios: una necesidad abierta cada vez, con un marcador que viaja por la lista
    const needs = document.getElementById('needs');

    if (needs) {
        const needButtons = [...needs.querySelectorAll('.need-btn')];
        const marker = document.createElement('span');
        marker.className = 'need-marker';
        marker.setAttribute('aria-hidden', 'true');
        needs.appendChild(marker);

        const placeMarker = () => {
            const active = needButtons.find((button) => button.getAttribute('aria-expanded') === 'true');
            const box = needs.getBoundingClientRect();
            const rect = active.getBoundingClientRect();
            const x = rect.right - box.left - 10;
            const y = rect.top - box.top + rect.height / 2 - 5;
            marker.style.transform = `translate(${x}px, ${y}px)`;
        };

        const openNeed = (active) => {
            needButtons.forEach((button) => {
                const isActive = button === active;
                button.setAttribute('aria-expanded', String(isActive));
                document.getElementById(button.getAttribute('aria-controls')).classList.toggle('is-active', isActive);
            });
            placeMarker();
        };

        needs.classList.add('is-ready');
        needButtons.forEach((button) => button.addEventListener('click', () => openNeed(button)));
        openNeed(needButtons[0]);
        if ('ResizeObserver' in window) new ResizeObserver(placeMarker).observe(needs);

        // Cada necesidad deja elegido el tipo de proyecto en el formulario
        const projectType = document.getElementById('project-type');
        needs.querySelectorAll('.need-cta').forEach((link) => {
            link.addEventListener('click', () => {
                if (projectType) projectType.value = link.dataset.project;
            });
        });
    }

    // 3d. Trabajos: la sección se queda fija y el scroll va subiendo cada proyecto sobre el anterior
    const pin = document.querySelector('.pin');

    if (pin) {
        const clamp = (value) => Math.min(1, Math.max(0, value));
        const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const sticky = pin.querySelector('.pin-sticky');
        const pinWorks = [...pin.querySelectorAll('.pin-work')];
        const shots = pinWorks.map((work) => work.querySelector('.work-shot'));
        const pinTicks = [...pin.querySelectorAll('.pin-tick')];
        const pinCurrent = document.getElementById('pin-current');
        const canPin = window.matchMedia('(min-width: 901px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)');
        const last = pinWorks.length - 1;
        let pinFrame = 0;

        const pinRange = () => pin.offsetHeight - sticky.offsetHeight;
        const pinTop = () => parseFloat(getComputedStyle(sticky).top) || 0;

        const setActiveWork = (index) => {
            pinWorks.forEach((work, i) => work.classList.toggle('is-active', i === index));
            pinTicks.forEach((tick, i) => {
                if (i === index) tick.setAttribute('aria-current', 'true');
                else tick.removeAttribute('aria-current');
            });
            pinCurrent.textContent = String(index + 1).padStart(2, '0');
        };

        const updatePin = () => {
            pinFrame = 0;
            if (!pin.classList.contains('is-pinned')) return;

            const progress = clamp((pinTop() - pin.getBoundingClientRect().top) / pinRange()) * last;
            const rise = window.innerHeight;

            shots.forEach((shot, i) => {
                // Entra desde abajo y, cuando llega el siguiente, retrocede un poco y se apaga
                const enter = i === 0 ? 1 : ease(clamp((progress - (i - 1) - 0.2) / 0.6));
                const leave = i === last ? 0 : ease(clamp((progress - i - 0.2) / 0.6));
                // Del todo cubierto ya no se ve, para que no se transparente tras el siguiente
                const gone = clamp((progress - i - 1) / 0.2);
                shot.style.transform = `translate3d(0, ${(1 - enter) * rise}px, 0) scale(${1 - leave * 0.06})`;
                shot.style.opacity = String((1 - leave * 0.75) * (1 - gone));
            });

            setActiveWork(Math.round(progress));
        };

        const requestPin = () => {
            if (!pinFrame) pinFrame = requestAnimationFrame(updatePin);
        };

        const applyPinMode = () => {
            const pinned = canPin.matches;
            pin.classList.toggle('is-pinned', pinned);
            pin.classList.toggle('is-revealing', !pinned && !reduceMotion);
            if (!pinned) {
                shots.forEach((shot) => {
                    shot.style.transform = '';
                    shot.style.opacity = '';
                });
                pinWorks.forEach((work) => work.classList.remove('is-active'));
            }
            requestPin();
        };

        pinTicks.forEach((tick, i) => {
            tick.addEventListener('click', () => {
                const start = pin.getBoundingClientRect().top + window.scrollY - pinTop();
                window.scrollTo({ top: start + (pinRange() * i) / last, behavior: 'smooth' });
            });
        });

        window.addEventListener('scroll', requestPin, { passive: true });
        window.addEventListener('resize', requestPin);
        canPin.addEventListener('change', applyPinMode);
        applyPinMode();

        // Sin sección fija, cada proyecto aparece al llegar a él
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-seen');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });
            pinWorks.forEach((work) => revealObserver.observe(work));
        } else {
            pinWorks.forEach((work) => work.classList.add('is-seen'));
        }
    }

    // 4. Borde de la cabecera al hacer scroll
    const header = document.getElementById('site-header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 5. Menú móvil
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

    // 6. Formulario de contacto (Formspree)
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
