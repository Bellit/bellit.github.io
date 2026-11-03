// DBellido · Comportamiento de la web principal y del CV.
// Cada función comprueba si su sección existe, porque el CV solo usa una parte.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasObserver = 'IntersectionObserver' in window;

const clamp = (value) => Math.min(1, Math.max(0, value));

// Ejecuta una actualización ligada al scroll como mucho una vez por fotograma
function onScrollFrame(update) {
    let frame = 0;
    const request = () => {
        if (!frame) {
            frame = requestAnimationFrame(() => {
                frame = 0;
                update();
            });
        }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return request;
}

// Ejecuta una acción la primera vez que un elemento entra en pantalla
function onceVisible(element, threshold, action) {
    const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            action();
        }
    }, { threshold });
    observer.observe(element);
}

function setCurrent(items, index) {
    items.forEach((item, i) => {
        if (i === index) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
    });
}

// ---------- Cabecera y menú ----------

function initHeader() {
    const header = document.getElementById('site-header');
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', update, { passive: true });
    update();
}

function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
}

// ---------- Monograma del CV ----------

// Cada letra es una sola forma a partir de un mapa de bits, sin juntas al escalar
function initPixelMark() {
    const mark = document.getElementById('pixel-mark');
    if (!mark) return;

    const bitmap = [
        'DDDD..BBBB.',
        'D...D.B...B',
        'D...D.B...B',
        'D...D.BBBB.',
        'D...D.B...B',
        'D...D.B...B',
        'DDDD..BBBB.'
    ];

    ['D', 'B'].forEach((letter, i) => {
        let d = '';
        bitmap.forEach((row, y) => {
            [...row].forEach((cell, x) => {
                if (cell === letter) d += `M${x} ${y}h1v1h-1z`;
            });
        });
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', letter === 'D' ? 'px-d' : 'px-b');
        path.style.setProperty('--i', i);
        mark.appendChild(path);
    });
}

// ---------- Portada: rótulo y piezas ----------

// Cada pieza es [x, y, ancho, alto, tono, giro] sobre una retícula de 40 × 30.
// Hay una composición por cada frase del rótulo, en el mismo orden.
const STAGE_LAYOUTS = [
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

// Devuelve la función que muestra una composición, o nada si la página no tiene escenario
function initStage() {
    const stage = document.getElementById('hero-stage');
    if (!stage) return () => {};

    const ticks = [...document.querySelectorAll('.hero-ticks .tick')];
    const pieces = STAGE_LAYOUTS[0].map((_, n) => {
        const piece = document.createElement('i');
        piece.style.setProperty('--n', n);
        stage.appendChild(piece);
        return piece;
    });
    let started = false;

    const show = (index) => {
        started = true;
        setCurrent(ticks, index);
        STAGE_LAYOUTS[index].forEach(([x, y, w, h, tone = 'n', turn = 0], n) => {
            pieces[n].className = `t-${tone}`;
            pieces[n].style.transform =
                `translate(${(x / 40) * 100}%, ${(y / 30) * 100}%) rotate(${turn}deg) scale(${w / 40}, ${h / 30})`;
        });
    };

    // Dos fotogramas de espera para que se vea la entrada de las piezas.
    // Si la pestaña carga en segundo plano, el rótulo puede haber avanzado antes.
    requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!started) show(0);
    }));

    return show;
}

function initRotator(onChange) {
    const rotator = document.getElementById('rotator');
    if (!rotator) return;

    const words = [
        'Webs en WordPress',
        'Tiendas con WooCommerce',
        'Desarrollo con IA',
        'Herramientas a medida',
        'Refactorización de código'
    ];
    let wordIndex = 0;
    let charIndex = words[0].length;
    let isDeleting = true;
    let timer;

    const type = () => {
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
            onChange(wordIndex);
            delay = 400;
        }
        timer = setTimeout(type, delay);
    };

    // Los marcadores saltan directamente a un tipo de proyecto
    const jumpTo = (index) => {
        onChange(index);
        if (reduceMotion) {
            rotator.textContent = words[index];
            return;
        }
        clearTimeout(timer);
        wordIndex = index;
        charIndex = 0;
        isDeleting = false;
        rotator.textContent = '';
        timer = setTimeout(type, 400);
    };

    document.querySelectorAll('.hero-ticks .tick').forEach((tick, index) => {
        tick.addEventListener('click', () => jumpTo(index));
    });

    if (!reduceMotion) timer = setTimeout(type, 2600);
}

// ---------- Qué hago: un panel abierto cada vez ----------

function initNeeds() {
    const needs = document.getElementById('needs');
    if (!needs) return;

    const buttons = [...needs.querySelectorAll('.need-btn')];
    const marker = document.createElement('span');
    marker.className = 'need-marker';
    marker.setAttribute('aria-hidden', 'true');
    needs.appendChild(marker);

    const placeMarker = () => {
        const active = buttons.find((button) => button.getAttribute('aria-expanded') === 'true');
        const box = needs.getBoundingClientRect();
        const rect = active.getBoundingClientRect();
        const x = rect.right - box.left - 10;
        const y = rect.top - box.top + rect.height / 2 - 5;
        marker.style.transform = `translate(${x}px, ${y}px)`;
    };

    const open = (active) => {
        buttons.forEach((button) => {
            const isActive = button === active;
            button.setAttribute('aria-expanded', String(isActive));
            document.getElementById(button.getAttribute('aria-controls')).classList.toggle('is-active', isActive);
        });
        placeMarker();
    };

    needs.classList.add('is-ready');
    buttons.forEach((button) => button.addEventListener('click', () => open(button)));
    open(buttons[0]);
    if ('ResizeObserver' in window) new ResizeObserver(placeMarker).observe(needs);
}

// ---------- Trabajos: sección fija que pasa los proyectos con el scroll ----------

function initWorks() {
    const pin = document.querySelector('.pin');
    if (!pin) return;

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const sticky = pin.querySelector('.pin-sticky');
    const works = [...pin.querySelectorAll('.pin-work')];
    const shots = works.map((work) => work.querySelector('.work-shot'));
    const ticks = [...pin.querySelectorAll('.tick')];
    const current = document.getElementById('pin-current');
    const canPin = window.matchMedia('(min-width: 901px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)');
    const last = works.length - 1;

    const range = () => pin.offsetHeight - sticky.offsetHeight;
    const stickyTop = () => parseFloat(getComputedStyle(sticky).top) || 0;

    const update = () => {
        if (!pin.classList.contains('is-pinned')) return;

        const progress = clamp((stickyTop() - pin.getBoundingClientRect().top) / range()) * last;
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

        const active = Math.round(progress);
        works.forEach((work, i) => work.classList.toggle('is-active', i === active));
        setCurrent(ticks, active);
        current.textContent = String(active + 1).padStart(2, '0');
    };

    const request = onScrollFrame(update);

    const applyMode = () => {
        const pinned = canPin.matches;
        pin.classList.toggle('is-pinned', pinned);
        pin.classList.toggle('is-revealing', !pinned && !reduceMotion);
        if (!pinned) {
            shots.forEach((shot) => {
                shot.style.transform = '';
                shot.style.opacity = '';
            });
            works.forEach((work) => work.classList.remove('is-active'));
        }
        request();
    };

    ticks.forEach((tick, i) => {
        tick.addEventListener('click', () => {
            const start = pin.getBoundingClientRect().top + window.scrollY - stickyTop();
            window.scrollTo({ top: start + (range() * i) / last, behavior: 'smooth' });
        });
    });

    canPin.addEventListener('change', applyMode);
    applyMode();

    // Sin sección fija, cada proyecto aparece al llegar a él
    works.forEach((work) => {
        if (hasObserver) onceVisible(work, 0.15, () => work.classList.add('is-seen'));
        else work.classList.add('is-seen');
    });
}

// ---------- IA: el proyecto antes y ahora ----------

function initTimeBar() {
    const bar = document.getElementById('time-bar');
    if (!bar) return;

    const tabs = [...document.querySelectorAll('.compare-tab')];
    const setMode = (withAi) => {
        bar.classList.toggle('with-ai', withAi);
        tabs.forEach((tab) => tab.setAttribute('aria-pressed', String((tab.dataset.mode === 'ai') === withAi)));
    };

    tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode === 'ai')));

    if (reduceMotion || !hasObserver) setMode(true);
    else onceVisible(bar, 0.5, () => setTimeout(() => setMode(true), 500));
}

// ---------- Cómo trabajo: el scroll va tachando lo que evito ----------

function initWorries() {
    const worries = document.getElementById('worries');
    if (!worries || reduceMotion) return;

    const rows = [...worries.querySelectorAll('.worry')];
    const marker = document.createElement('span');
    marker.className = 'worry-marker';
    marker.setAttribute('aria-hidden', 'true');
    worries.appendChild(marker);
    worries.classList.add('is-live');

    const update = () => {
        // Cada fila se tacha mientras recorre su propia altura, así van de una en una
        const start = window.innerHeight * 0.62;
        const box = worries.getBoundingClientRect();
        let current = rows[0];

        rows.forEach((row) => {
            const rect = row.getBoundingClientRect();
            const strike = clamp((start - rect.top) / rect.height);
            row.style.setProperty('--strike', strike.toFixed(3));
            row.classList.toggle('is-solved', strike === 1);
            if (rect.top < start) current = row;
        });

        rows.forEach((row) => row.classList.toggle('is-current', row === current));
        marker.style.transform = `translateY(${current.getBoundingClientRect().top - box.top}px)`;
    };

    onScrollFrame(update);
    update();
}

// ---------- Quién soy: el texto se enciende palabra a palabra ----------

function initLetter() {
    const letter = document.getElementById('letter');
    if (!letter || reduceMotion) return;

    const words = [];

    // Parte el texto en palabras sin perder las que van resaltadas
    const splitWords = (target, text) => {
        text.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
                target.append(' ');
                return;
            }
            const word = document.createElement('span');
            word.setAttribute('aria-hidden', 'true');
            word.textContent = part;
            target.append(word);
            words.push(word);
        });
    };

    letter.querySelectorAll('p').forEach((paragraph) => {
        paragraph.setAttribute('aria-label', paragraph.textContent.trim());
        const nodes = [...paragraph.childNodes];
        paragraph.textContent = '';
        nodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                splitWords(paragraph, node.textContent);
            } else {
                const key = node.cloneNode(false);
                splitWords(key, node.textContent);
                paragraph.append(key);
            }
        });
    });

    const update = () => {
        const box = letter.getBoundingClientRect();
        const start = window.innerHeight * 0.8;
        const end = window.innerHeight * 0.45;
        const lit = clamp((start - box.top) / (box.height + start - end)) * words.length;
        words.forEach((word, i) => {
            word.style.opacity = String(0.22 + 0.78 * clamp(lit - i));
        });
    };

    onScrollFrame(update);
    update();
}

// ---------- Preguntas: cada respuesta se escribe al llegar a ella ----------

function initChat() {
    const chat = document.getElementById('chat');
    if (!chat || reduceMotion || !hasObserver) return;

    chat.classList.add('is-live');
    chat.querySelectorAll('.chat-pair').forEach((pair) => {
        onceVisible(pair, 0.6, () => {
            pair.classList.add('is-asked');
            setTimeout(() => pair.classList.add('is-typing'), 350);
            setTimeout(() => pair.classList.add('is-answered'), 1150);
        });
    });
}

// ---------- Contacto ----------

// Envío a Formspree sin salir de la página
function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    const show = (message, state = '') => {
        status.className = `form-status ${state}`.trim();
        status.textContent = message;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        show('Enviando…');

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (response.ok) {
                show('Mensaje enviado. Te respondo pronto.', 'is-ok');
                form.reset();
            } else {
                const data = await response.json().catch(() => ({}));
                show(data.errors
                    ? data.errors.map((err) => err.message).join(', ')
                    : 'No se ha podido enviar. Inténtalo de nuevo.', 'is-error');
            }
        } catch (error) {
            show('Sin conexión. Revisa tu red e inténtalo de nuevo.', 'is-error');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMenu();
    initPixelMark();
    initRotator(initStage());
    initNeeds();
    initWorks();
    initTimeBar();
    initWorries();
    initLetter();
    initChat();
    initContactForm();
});
