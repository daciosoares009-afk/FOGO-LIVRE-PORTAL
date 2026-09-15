/* =====================================================================
   FOGO ZERO — main.js
   JavaScript puro, sem dependências. Responsável por:
   1. Header com fundo sólido ao rolar
   2. Menu mobile (abrir/fechar, acessível, fecha ao clicar em link)
   3. Animações de entrada (reveal) via IntersectionObserver
   4. Linha do processo (Nossa Proposta) animando ao entrar na tela
   5. Parallax extremamente sutil no Hero
===================================================================== */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupHeaderScroll();
        setupMobileMenu();
        setupRevealAnimations();
        setupProcessLine();
        setupHeroParallax();
        setupSkipLink();
    }


    /* -------------------------------------------------------------
       1. HEADER — fundo sólido/blur ao rolar
    ------------------------------------------------------------- */

    function setupHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        const THRESHOLD = 60;

        const updateHeader = () => {
            header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
        };

        updateHeader();
        window.addEventListener('scroll', throttle(updateHeader, 100), { passive: true });
    }


    /* -------------------------------------------------------------
       2. MENU MOBILE
    ------------------------------------------------------------- */

    function setupMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const nav = document.getElementById('navigation');
        if (!toggle || !nav) return;

        const closeMenu = () => {
            nav.classList.remove('is-open');
            toggle.classList.remove('is-active');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menu');
            document.body.classList.remove('nav-open');
        };

        const openMenu = () => {
            nav.classList.add('is-open');
            toggle.classList.add('is-active');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Fechar menu');
            document.body.classList.add('nav-open');
        };

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('is-open');
            isOpen ? closeMenu() : openMenu();
        });

        // Fecha ao clicar em qualquer link do menu
        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        // Fecha com a tecla Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && nav.classList.contains('is-open')) {
                closeMenu();
                toggle.focus();
            }
        });

        // Fecha se a tela for redimensionada para desktop
        window.addEventListener('resize', throttle(() => {
            if (window.innerWidth > 900 && nav.classList.contains('is-open')) {
                closeMenu();
            }
        }, 150));
    }


    /* -------------------------------------------------------------
       3. REVEAL — fade-up ao entrar na viewport
    ------------------------------------------------------------- */

    function setupRevealAnimations() {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        // Seleciona elementos que devem revelar suavemente,
        // sem exigir alterações no HTML existente.
        const selectors = [
            '.section-header',
            '.feature-card',
            '.impact-card',
            '.split-image',
            '.split-content',
            '.process-item',
            '.expo-content',
            '.instagram-content',
            '.stat-card',
            '.team-card',
            '.reference-group'
        ];

        const elements = document.querySelectorAll(selectors.join(','));

        elements.forEach((el) => el.setAttribute('data-reveal', ''));

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            elements.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        // Delay progressivo para elementos que aparecem em grade,
        // criando um efeito de revelação em cascata discreto.
        applyStaggerDelay('.feature-grid', '.feature-card');
        applyStaggerDelay('.impact-grid', '.impact-card');
        applyStaggerDelay('.stat-grid', '.stat-card');
        applyStaggerDelay('.team-grid', '.team-card');

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
        );

        elements.forEach((el) => observer.observe(el));
    }

    function applyStaggerDelay(gridSelector, itemSelector) {
        document.querySelectorAll(gridSelector).forEach((grid) => {
            const items = grid.querySelectorAll(itemSelector);
            items.forEach((item, index) => {
                item.style.setProperty('--reveal-delay', `${index * 90}ms`);
            });
        });
    }


    /* -------------------------------------------------------------
       4. LINHA DO PROCESSO — Educação > Prevenção > Monitoramento > Tecnologia
    ------------------------------------------------------------- */

    function setupProcessLine() {
        const lines = document.querySelectorAll('.process-line');
        if (!lines.length) return;

        if (!('IntersectionObserver' in window)) {
            lines.forEach((line) => line.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        const line = entry.target;
                        const index = Array.from(lines).indexOf(line);
                        setTimeout(() => line.classList.add('is-visible'), index * 150);
                        obs.unobserve(line);
                    }
                });
            },
            { threshold: 0.4 }
        );

        lines.forEach((line) => observer.observe(line));
    }


    /* -------------------------------------------------------------
       5. PARALLAX SUTIL NO HERO
    ------------------------------------------------------------- */

    function setupHeroParallax() {
        const bg = document.querySelector('.hero-background');
        if (!bg) return;

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        if (prefersReducedMotion) return;

        const MAX_TRANSLATE = 28; // px — efeito discreto, não deve incomodar

        const updateParallax = () => {
            const offset = Math.min(window.scrollY * 0.12, MAX_TRANSLATE * 4);
            bg.style.transform = `translateY(${Math.min(offset, MAX_TRANSLATE)}px) scale(1.06)`;
        };

        updateParallax();
        window.addEventListener('scroll', throttle(updateParallax, 16), { passive: true });
    }


    /* -------------------------------------------------------------
       6. SKIP LINK — acessibilidade de teclado
    ------------------------------------------------------------- */

    function setupSkipLink() {
        const main = document.querySelector('main');
        if (!main) return;

        main.id = main.id || 'conteudo-principal';

        const skipLink = document.createElement('a');
        skipLink.href = `#${main.id}`;
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Pular para o conteúdo';
        document.body.prepend(skipLink);
    }


    /* -------------------------------------------------------------
       UTILITÁRIOS
    ------------------------------------------------------------- */

    function throttle(fn, wait) {
        let lastCall = 0;
        let timeoutId = null;

        return function throttled(...args) {
            const now = Date.now();
            const remaining = wait - (now - lastCall);

            if (remaining <= 0) {
                lastCall = now;
                fn.apply(this, args);
            } else if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    lastCall = Date.now();
                    timeoutId = null;
                    fn.apply(this, args);
                }, remaining);
            }
        };
    }

})();
