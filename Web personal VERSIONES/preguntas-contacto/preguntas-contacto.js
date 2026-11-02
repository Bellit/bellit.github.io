document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasObserver = 'IntersectionObserver' in window;

    // 1. Preguntas A: una respuesta abierta cada vez, con transición de altura
    const fold = document.getElementById('fold');
    const foldButtons = [...fold.querySelectorAll('.fold-btn')];

    const openFold = (active) => {
        foldButtons.forEach((button) => {
            const isOpen = button === active && button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(isOpen));
            document.getElementById(button.getAttribute('aria-controls')).classList.toggle('is-closed', !isOpen);
        });
    };

    fold.classList.add('is-live');
    foldButtons.forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => openFold(button));
    });
    openFold(foldButtons[0]);

    // 2. Preguntas B: cada pregunta aparece, se escribe la respuesta y se muestra
    const chat = document.getElementById('chat');

    if (!reduceMotion && hasObserver) {
        chat.classList.add('is-live');
        const chatObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const pair = entry.target;
                chatObserver.unobserve(pair);
                pair.classList.add('is-asked');
                setTimeout(() => pair.classList.add('is-typing'), 350);
                setTimeout(() => pair.classList.add('is-answered'), 1150);
            });
        }, { threshold: 0.6 });
        chat.querySelectorAll('.chat-pair').forEach((pair) => chatObserver.observe(pair));
    }

    // 3. Estos formularios son de prueba: no se envía ningún mensaje real
    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let note = form.querySelector('.form-note');
            if (!note) {
                note = document.createElement('p');
                note.className = 'form-note';
                note.setAttribute('role', 'status');
                form.append(note);
            }
            note.textContent = 'Página de prueba: este mensaje no se ha enviado.';
        });
    });

    // 4. Selectores: cada sección elige su propuesta por separado
    const picker = document.getElementById('picker');
    const buttons = [...picker.querySelectorAll('.picker-btn')];
    const state = { faq: 'a', contacto: 'a' };

    const render = () => {
        document.querySelectorAll('section[data-group]').forEach((section) => {
            section.hidden = section.dataset.choice !== state[section.dataset.group];
        });
        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(state[button.dataset.group] === button.dataset.choice));
        });
    };

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            state[button.dataset.group] = button.dataset.choice;
            render();
            const shown = document.querySelector(`section[data-group="${button.dataset.group}"][data-choice="${button.dataset.choice}"]`);
            window.scrollTo({ top: shown.getBoundingClientRect().top + window.scrollY - 130 });
        });
    });

    picker.hidden = false;
    render();
});
