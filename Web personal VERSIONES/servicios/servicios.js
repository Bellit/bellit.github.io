document.addEventListener('DOMContentLoaded', () => {
    // 1. Selector de propuesta: sin JavaScript se ven las tres, una debajo de otra
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

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            showOption(button.dataset.option);
            history.replaceState(null, '', `#${button.dataset.option}`);
            window.scrollTo({ top: 0 });
        });
    });

    const showFromHash = () => {
        const fromHash = location.hash.slice(1);
        showOption(options.some((option) => option.id === fromHash) ? fromHash : 'necesidades');
        window.scrollTo({ top: 0 });
    };

    picker.hidden = false;
    showFromHash();
    window.addEventListener('hashchange', showFromHash);

    // 2. Propuesta A: una necesidad abierta cada vez
    const needButtons = [...document.querySelectorAll('.need-btn')];

    const openNeed = (active) => {
        needButtons.forEach((button) => {
            const isActive = button === active;
            button.setAttribute('aria-expanded', String(isActive));
            document.getElementById(button.getAttribute('aria-controls')).hidden = !isActive;
        });
    };

    needButtons.forEach((button) => button.addEventListener('click', () => openNeed(button)));
    openNeed(needButtons[0]);
});
