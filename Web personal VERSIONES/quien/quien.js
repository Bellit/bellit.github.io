document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Propuesta A: el texto se enciende palabra a palabra al bajar
    const letter = document.getElementById('letter');
    let words = [];
    let frame = 0;

    const updateLetter = () => {
        frame = 0;
        const box = letter.getBoundingClientRect();
        if (!box.height) return;
        const viewport = window.innerHeight;
        const start = viewport * 0.8;
        const end = viewport * 0.45;
        const progress = Math.min(1, Math.max(0, (start - box.top) / (box.height + start - end)));
        const lit = progress * words.length;
        words.forEach((word, i) => {
            word.style.opacity = String(0.22 + 0.78 * Math.min(1, Math.max(0, lit - i)));
        });
    };

    const requestLetter = () => {
        if (!frame) frame = requestAnimationFrame(updateLetter);
    };

    if (!reduceMotion) {
        letter.querySelectorAll('p').forEach((paragraph) => {
            const parts = paragraph.textContent.trim().split(/\s+/);
            paragraph.setAttribute('aria-label', parts.join(' '));
            paragraph.textContent = '';
            parts.forEach((part, i) => {
                const word = document.createElement('span');
                word.setAttribute('aria-hidden', 'true');
                word.textContent = part;
                paragraph.append(word);
                if (i < parts.length - 1) paragraph.append(' ');
                words.push(word);
            });
        });
        window.addEventListener('scroll', requestLetter, { passive: true });
        window.addEventListener('resize', requestLetter);
    }

    // 2. Propuesta B: la barra crece al llegar y cada tramo muestra su puesto
    const bar = document.getElementById('career-bar');
    const segments = [...bar.querySelectorAll('.career-seg')];
    const jobsList = document.getElementById('career-jobs');
    const jobs = [...jobsList.querySelectorAll('.career-job')];

    const selectJob = (index) => {
        segments.forEach((segment, i) => {
            if (i === index) segment.setAttribute('aria-current', 'true');
            else segment.removeAttribute('aria-current');
        });
        jobs.forEach((job, i) => job.classList.toggle('is-active', i === index));
    };

    segments.forEach((segment, i) => segment.addEventListener('click', () => selectJob(i)));
    jobsList.classList.add('is-live');
    selectJob(segments.length - 1);

    if (!reduceMotion && 'IntersectionObserver' in window) {
        bar.classList.add('is-waiting');
        const barObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                bar.classList.remove('is-waiting');
                barObserver.disconnect();
            }
        }, { threshold: 0.5 });
        barObserver.observe(bar);
    }

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
        if (!reduceMotion) requestLetter();
    };

    const showFromHash = () => {
        const fromHash = location.hash.slice(1);
        showOption(options.some((option) => option.id === fromHash) ? fromHash : 'carta');
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
