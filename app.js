document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Typewriter Effect
    const typewriterElement = document.getElementById('typewriter');
    const words = [
        'Full-Stack Developer',
        'Especialista en PHP & JavaScript',
        '10+ años creando soluciones web',
        'Apasionado por el código y la lógica'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function type() {
        const currentWord = words[wordIndex];
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeDelay = 50;
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeDelay = 120;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            // Pause at the end of the word
            typeDelay = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            // Short pause before typing next word
            typeDelay = 500;
        }

        setTimeout(type, typeDelay);
    }

    if (typewriterElement) {
        setTimeout(type, 1000);
    }

    // 3. Header Scroll Styling
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');

            // Toggle icon menu / close
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons();
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // 5. Intersection Observer for Reveal Animations
    // Dynamic entry animations for cards and sections
    const revealElements = [
        document.querySelector('.terminal-window'),
        ...document.querySelectorAll('.timeline-item'),
        ...document.querySelectorAll('.skill-card'),
        document.querySelector('.education-card'),
        document.querySelector('.contact-info'),
        document.querySelector('.contact-form-wrapper')
    ];

    // Add CSS reveal class to elements dynamically if not already set
    revealElements.forEach(el => {
        if (el) el.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    const activeRevealElements = document.querySelectorAll('.reveal');
    activeRevealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 6. Contact Form AJAX Submission (Formspree API Integration)
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Terminal-like loading status
            formStatus.className = 'form-status';
            formStatus.textContent = 'CONNECTING TO SERVER... SENDING PAYLOAD_';

            const data = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = 'SYSTEM: MESSAGE TRANSMITTED SUCCESSFULLY. WILL CONTACT YOU SOON_';
                    contactForm.reset();
                } else {
                    const responseData = await response.json();
                    if (responseData.errors) {
                        formStatus.className = 'form-status error';
                        formStatus.textContent = `ERROR: ${responseData.errors.map(err => err.message).join(', ')}`;
                    } else {
                        formStatus.className = 'form-status error';
                        formStatus.textContent = 'ERROR: SERVER REJECTED CONNECTION. PLEASE TRY AGAIN_';
                    }
                }
            } catch (error) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'NETWORK_ERROR: OFFLINE OR HOST RESOLUTION FAILED_';
            }
        });
    }
});
