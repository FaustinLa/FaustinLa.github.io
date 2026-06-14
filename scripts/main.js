/**
 * main.js - Core functionality for the Faustin Larose Portfolio
 * Handles Dark Mode, Scroll Animations, and Project Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       DARK MODE TOGGLE
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    // Check for saved user preference, if any, on load of the website
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
        if(themeToggleBtn) themeToggleBtn.innerHTML = sunIcon;
    } else if (savedTheme === 'light') {
        htmlElement.classList.remove('dark');
        if(themeToggleBtn) themeToggleBtn.innerHTML = moonIcon;
    } else {
        // Fallback to system preference if no localStorage set
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            htmlElement.classList.add('dark');
            if(themeToggleBtn) themeToggleBtn.innerHTML = sunIcon;
        } else {
            if(themeToggleBtn) themeToggleBtn.innerHTML = moonIcon;
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = moonIcon;
            } else {
                htmlElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = sunIcon;
            }
        });
    }

    /* ==========================================================================
       SCROLL ANIMATIONS (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal, .pcb-line');

    // Respect user's prefers-reduced-motion setting
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, {
            root: null,
            threshold: 0.10, // Trigger slightly earlier for a smoother feel
            rootMargin: "0px 0px -20px 0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers or reduced motion preference
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    /* ==========================================================================
       PROJECT FILTERING
       ========================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0 && projectCards.length > 0) {
        let activeFilters = new Set(['Tous']);

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterValue = btn.getAttribute('data-filter');

                if (filterValue === 'Tous') {
                    // Reset all filters
                    activeFilters.clear();
                    activeFilters.add('Tous');
                    
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                } else {
                    // Toggle specific filter
                    if (activeFilters.has('Tous')) {
                        activeFilters.delete('Tous');
                        document.querySelector('.filter-btn[data-filter="Tous"]').classList.remove('active');
                    }

                    if (activeFilters.has(filterValue)) {
                        activeFilters.delete(filterValue);
                        btn.classList.remove('active');
                    } else {
                        activeFilters.add(filterValue);
                        btn.classList.add('active');
                    }

                    // If no filters are active, fallback to "Tous"
                    if (activeFilters.size === 0) {
                        activeFilters.add('Tous');
                        document.querySelector('.filter-btn[data-filter="Tous"]').classList.add('active');
                    }
                }

                // Apply filters to cards with smooth transition
                projectCards.forEach(card => {
                    const cardTags = card.getAttribute('data-tags').split(',');
                    
                    let shouldShow = false;
                    if (activeFilters.has('Tous')) {
                        shouldShow = true;
                    } else {
                        // Check if card has AT LEAST ONE of the active filters (OR logic)
                        // Note: The specs say "Les filtres sont cumulables (ex: BUT3 + Logiciel)". 
                        // If it meant AND logic, change some to every. OR logic is usually better for tags.
                        // Let's implement AND logic if they are cumulative, meaning if you click BUT3 and Logiciel, 
                        // you only see projects that are BOTH BUT3 and Logiciel.
                        shouldShow = Array.from(activeFilters).every(filter => cardTags.includes(filter.trim()));
                    }

                    if (shouldShow) {
                        card.style.display = 'block';
                        // Small delay to allow display:block to apply before opacity transition
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300); // Matches CSS transition duration
                    }
                });
            });
        });
        
        // Initial setup for transitions
        projectCards.forEach(card => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        });
    }

    /* ==========================================================================
       MODAL POPUPS (DIALOG SYSTEM)
       ========================================================================== */
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.showModal();
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('dialog');
            if (modal) {
                modal.close();
                document.body.style.overflow = '';
            }
        });
    });

    // Close on click backdrop
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            const rect = dialog.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                dialog.close();
                document.body.style.overflow = '';
            }
        });
        dialog.addEventListener('close', () => {
            document.body.style.overflow = '';
        });
    });

    /* ==========================================================================
       CAROUSEL / SLIDER SYSTEM
       ========================================================================== */
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        let currentIndex = 0;
        let autoPlayInterval;

        function showSlide(index) {
            if (slides.length === 0) return;
            slides[currentIndex].classList.remove('active');
            if (indicators.length > currentIndex) {
                indicators[currentIndex].classList.remove('active');
            }

            currentIndex = (index + slides.length) % slides.length;

            slides[currentIndex].classList.add('active');
            if (indicators.length > currentIndex) {
                indicators[currentIndex].classList.add('active');
            }
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                prevSlide();
                resetAutoplay();
            });
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextSlide();
                resetAutoplay();
            });
        }

        indicators.forEach((ind, i) => {
            ind.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(i);
                resetAutoplay();
            });
        });

        function startAutoplay() {
            if (slides.length > 1) {
                autoPlayInterval = setInterval(nextSlide, 4000); // 4 seconds
            }
        }

        function resetAutoplay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
            startAutoplay();
        }

        startAutoplay();
    });
});

