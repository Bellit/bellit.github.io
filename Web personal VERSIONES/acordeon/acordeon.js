// Una respuesta abierta cada vez. Sin JavaScript se ven todas.
document.addEventListener('DOMContentLoaded', () => {
    const fold = document.getElementById('fold');
    const buttons = [...fold.querySelectorAll('.fold-btn')];

    const toggle = (active) => {
        buttons.forEach((button) => {
            const isOpen = button === active && button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(isOpen));
            document.getElementById(button.getAttribute('aria-controls')).classList.toggle('is-closed', !isOpen);
        });
    };

    fold.classList.add('is-live');
    buttons.forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => toggle(button));
    });
    toggle(buttons[0]);
});
