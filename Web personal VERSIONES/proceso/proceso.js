document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasObserver = 'IntersectionObserver' in window;

    // 1. Sección actual: los pasos se completan al llegar a ellos
    const steps = document.getElementById('steps');
    if (steps && !reduceMotion && hasObserver) {
        steps.classList.add('is-waiting');
        const stepsObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                steps.classList.remove('is-waiting');
                stepsObserver.disconnect();
            }
        }, { threshold: 0.4 });
        stepsObserver.observe(steps);
    }

    // 2. Propuesta A: el raíl se llena con el scroll y enciende cada paso
    const track = document.getElementById('track');
    const fill = track.querySelector('.track-fill');
    const trackSteps = [...track.querySelectorAll('.track-step')];
    let frame = 0;

    const updateTrack = () => {
        frame = 0;
        const box = track.getBoundingClientRect();
        if (!box.height) return;
        const line = window.innerHeight * 0.6;
        const progress = Math.min(1, Math.max(0, (line - box.top) / box.height));
        fill.style.transform = `scaleY(${progress})`;
        trackSteps.forEach((step) => {
            step.classList.toggle('is-reached', step.getBoundingClientRect().top < line);
        });
    };

    const requestTrack = () => {
        if (!frame) frame = requestAnimationFrame(updateTrack);
    };

    if (!reduceMotion) {
        track.classList.add('is-live');
        window.addEventListener('scroll', requestTrack, { passive: true });
        window.addEventListener('resize', requestTrack);
    }

    // 3. Propuesta B: cada duda se tacha y aparece su respuesta al llegar a ella
    const worries = document.getElementById('worries');

    if (!reduceMotion && hasObserver) {
        worries.classList.add('is-live');
        const worryObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-seen');
                    worryObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        worries.querySelectorAll('.worry').forEach((worry) => worryObserver.observe(worry));
    }

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
        if (!reduceMotion) requestTrack();
    };

    const showFromHash = () => {
        const fromHash = location.hash.slice(1);
        showOption(options.some((option) => option.id === fromHash) ? fromHash : 'recorrido');
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
