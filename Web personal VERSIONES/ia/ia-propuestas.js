document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Ejecuta una acción la primera vez que un elemento entra en pantalla
    const whenSeen = (element, action, threshold = 0.3) => {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            action();
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                action();
                observer.disconnect();
            }
        }, { threshold });
        observer.observe(element);
    };

    // 1. Sección actual: los carriles se dibujan al llegar
    const flow = document.getElementById('ai-flow');
    if (flow && !reduceMotion) flow.classList.add('is-waiting');
    if (flow) whenSeen(flow, () => flow.classList.remove('is-waiting'));

    // 2. Propuesta A: los dos campos de color entran desde los lados
    const split = document.getElementById('split');
    if (!reduceMotion) split.classList.add('is-waiting');
    whenSeen(split, () => split.classList.remove('is-waiting'));

    // 3. Propuesta B: al llegar se ve el cambio; después se puede alternar
    const bar = document.getElementById('time-bar');
    const tabs = [...document.querySelectorAll('.compare-tab')];

    const setMode = (withAi) => {
        bar.classList.toggle('with-ai', withAi);
        tabs.forEach((tab) => tab.setAttribute('aria-pressed', String((tab.dataset.mode === 'ai') === withAi)));
    };

    tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode === 'ai')));
    whenSeen(bar, () => setTimeout(() => setMode(true), reduceMotion ? 0 : 500), 0.5);

    // 4. Selector de propuesta: sin JavaScript se ven las tres, una debajo de otra
    const picker = document.getElementById('picker');
    const options = [...document.querySelectorAll('.option')];
    const buttons = [...picker.querySelectorAll('.picker-btn')];

    const showOption = (id) => {
        options.forEach((option) => {
            option.hidden = option.id !== id;
        });
        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.option === id));
        });
    };

    const showFromHash = () => {
        const fromHash = location.hash.slice(1);
        showOption(options.some((option) => option.id === fromHash) ? fromHash : 'reparto');
        window.scrollTo({ top: 0 });
    };

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            history.replaceState(null, '', `#${button.dataset.option}`);
            showFromHash();
        });
    });

    picker.hidden = false;
    showFromHash();
    window.addEventListener('hashchange', showFromHash);
});
