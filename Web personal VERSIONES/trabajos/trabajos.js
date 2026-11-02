document.addEventListener('DOMContentLoaded', () => {
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const pad = (n) => String(n).padStart(2, '0');

    // 1. Propuesta A: la sección se queda fija y el scroll va subiendo cada proyecto sobre el anterior
    const pin = document.getElementById('fija');
    const sticky = pin.querySelector('.pin-sticky');
    const pinWorks = [...pin.querySelectorAll('.pin-work')];
    const shots = pinWorks.map((work) => work.querySelector('.work-shot'));
    const ticks = [...pin.querySelectorAll('.pin-tick')];
    const current = document.getElementById('pin-current');
    const canPin = window.matchMedia('(min-width: 901px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)');
    const last = pinWorks.length - 1;
    let frame = 0;

    const pinRange = () => pin.offsetHeight - sticky.offsetHeight;
    const pinTop = () => parseFloat(getComputedStyle(sticky).top) || 0;

    const setActive = (index) => {
        pinWorks.forEach((work, i) => work.classList.toggle('is-active', i === index));
        ticks.forEach((tick, i) => {
            if (i === index) tick.setAttribute('aria-current', 'true');
            else tick.removeAttribute('aria-current');
        });
        current.textContent = pad(index + 1);
    };

    const updatePin = () => {
        frame = 0;
        if (!pin.classList.contains('is-pinned') || pin.hidden) return;

        const progress = clamp((pinTop() - pin.getBoundingClientRect().top) / pinRange()) * last;
        const rise = window.innerHeight;

        shots.forEach((shot, i) => {
            // Entra desde abajo y, cuando llega el siguiente, retrocede un poco y se apaga
            const enter = i === 0 ? 1 : ease(clamp((progress - (i - 1) - 0.2) / 0.6));
            const leave = i === last ? 0 : ease(clamp((progress - i - 0.2) / 0.6));
            shot.style.transform = `translate3d(0, ${(1 - enter) * rise}px, 0) scale(${1 - leave * 0.06})`;
            // Del todo cubierto ya no se ve, para que no se transparente tras el siguiente
            const gone = clamp((progress - i - 1) / 0.2);
            shot.style.opacity = String((1 - leave * 0.75) * (1 - gone));
        });

        setActive(Math.round(progress));
    };

    const requestPin = () => {
        if (!frame) frame = requestAnimationFrame(updatePin);
    };

    const applyPinMode = () => {
        const pinned = canPin.matches;
        pin.classList.toggle('is-pinned', pinned);
        pin.classList.toggle('is-revealing', !pinned && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        if (!pinned) {
            shots.forEach((shot) => {
                shot.style.transform = '';
                shot.style.opacity = '';
            });
            pinWorks.forEach((work) => work.classList.remove('is-active'));
        }
        requestPin();
    };

    ticks.forEach((tick, i) => {
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

    // 2. Propuesta B: carrusel con desplazamiento nativo; las flechas y el contador lo acompañan
    const strip = document.getElementById('strip');
    const stripWorks = [...strip.querySelectorAll('.strip-work')];
    const stripCurrent = document.getElementById('strip-current');
    const prev = document.getElementById('strip-prev');
    const next = document.getElementById('strip-next');
    let stripIndex = 0;

    const updateStrip = () => {
        const side = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
        const distances = stripWorks.map((work) => Math.abs(work.offsetLeft - strip.offsetLeft - side - strip.scrollLeft));
        stripIndex = distances.indexOf(Math.min(...distances));
        stripWorks.forEach((work, i) => work.classList.toggle('is-active', i === stripIndex));
        stripCurrent.textContent = pad(stripIndex + 1);
        prev.disabled = stripIndex === 0;
        next.disabled = stripIndex === stripWorks.length - 1;
    };

    const goToStrip = (index) => {
        const side = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
        strip.scrollTo({ left: stripWorks[index].offsetLeft - strip.offsetLeft - side, behavior: 'smooth' });
    };

    prev.addEventListener('click', () => goToStrip(Math.max(0, stripIndex - 1)));
    next.addEventListener('click', () => goToStrip(Math.min(stripWorks.length - 1, stripIndex + 1)));
    strip.addEventListener('scroll', updateStrip, { passive: true });
    window.addEventListener('resize', updateStrip);

    // 3. Selector de propuesta: sin JavaScript se ven las tres, una debajo de otra
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
        requestPin();
        updateStrip();
    };

    const showFromHash = () => {
        const fromHash = location.hash.slice(1);
        showOption(options.some((option) => option.id === fromHash) ? fromHash : 'fija');
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
