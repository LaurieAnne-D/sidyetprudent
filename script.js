// Animations au scroll (IntersectionObserver)
// - .reveal + variante (.reveal-up / .reveal-left / .reveal-right / .reveal-zoom / .reveal-wipe)
// - data-stagger="80" sur un conteneur pour décaler les enfants .reveal (cascade)
// - data-reveal-once sur un élément pour ne l'animer qu'une seule fois

(() => {
    // Accessibilité : si l'utilisateur réduit les animations, on affiche tout
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
        return;
    }

    // Cascade automatique
    document.querySelectorAll('[data-stagger]').forEach(container => {
        const step = parseInt(container.getAttribute('data-stagger'), 10) || 80; // ms
        container.querySelectorAll('.reveal').forEach((el, i) => {
            el.style.setProperty('--delay', (i * step) + 'ms');
        });
    });

    // Observer
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const el = entry.target;
            const once = el.hasAttribute('data-reveal-once');
            if (entry.isIntersecting) {
                el.classList.add('is-in');
                if (once) io.unobserve(el);
            } else {
                if (!once) el.classList.remove('is-in');
            }
        }
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
    });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ================================
Compte à rebours (externe)
   ================================ */

/**
 * Initialise un compte à rebours.
 * - targetISO: string ISO ex. "2026-01-10T15:00:00"
 * - ids: les IDs des spans à mettre à jour.
 */
function initCountdown(
    targetISO = "2026-01-10T15:00:00",
    ids = { d: "cd-days", h: "cd-hours", m: "cd-mins", s: "cd-secs" }
) {
    const target = new Date(targetISO);
    const $d = document.getElementById(ids.d);
    const $h = document.getElementById(ids.h);
    const $m = document.getElementById(ids.m);
    const $s = document.getElementById(ids.s);

    if (!$d || !$h || !$m || !$s) return; // ids manquants → on sort proprement

    const pad2 = (n) => n.toString().padStart(2, "0");

    function tick() {
        const now = new Date();
        let diff = Math.max(0, target - now);

        const d = Math.floor(diff / 86400000); diff -= d * 86400000;
        const h = Math.floor(diff / 3600000); diff -= h * 3600000;
        const m = Math.floor(diff / 60000); diff -= m * 60000;
        const s = Math.floor(diff / 1000);

        $d.textContent = pad2(d);
        $h.textContent = pad2(h);
        $m.textContent = pad2(m);
        $s.textContent = pad2(s);
    }

    tick();
    return setInterval(tick, 1000);
}

/* Auto-init si un attribut data-countdown est présent */
document.addEventListener("DOMContentLoaded", () => {
    const el = document.querySelector("[data-countdown]");
    if (el) {
        initCountdown(el.getAttribute("data-countdown"));
    } else {
        // fallback : date par défaut (modifie-la si besoin)
        initCountdown("2026-01-10T15:00:00");
    }
});

// FAQ <details> — ouverture/fermeture fluides, robustes (sans toggle natif)
(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Option : true => un seul panneau ouvert à la fois
    const onlyOneOpen = false;

    const items = document.querySelectorAll('.faq-item');
    items.forEach((details) => {
        const summary = details.querySelector('summary');
        const panel = details.querySelector('.faq-content');
        if (!summary || !panel) return;

        let animating = false;

        // État initial si <details open> présent au chargement
        if (details.hasAttribute('open')) {
            panel.style.height = 'auto';
            panel.classList.add('is-open');
        } else {
            panel.style.height = '0px';
            panel.classList.remove('is-open');
        }

        summary.addEventListener('click', (e) => {
            // Empêche le toggle natif (qui cause les glitches)
            e.preventDefault();
            if (animating) return;

            const isOpen = details.hasAttribute('open');
            if (isOpen) {
                close(details, panel);
            } else {
                if (onlyOneOpen) {
                    // Ferme les autres d'abord
                    items.forEach((other) => {
                        if (other !== details && other.hasAttribute('open')) {
                            const otherPanel = other.querySelector('.faq-content');
                            if (otherPanel) close(other, otherPanel);
                        }
                    });
                }
                open(details, panel);
            }
        });

        function open(el, panelEl) {
            animating = true;
            el.classList.add('is-animating');

            // pose l'état "ouvert" pour l'accessibilité/ARIA
            el.setAttribute('open', '');

            // 0 -> hauteur finale
            panelEl.classList.add('is-open');
            panelEl.style.height = '0px';
            panelEl.style.opacity = '0';
            requestAnimationFrame(() => {
                panelEl.style.height = panelEl.scrollHeight + 'px';
                panelEl.style.opacity = '1';
            });

            const onEnd = (ev) => {
                if (ev.propertyName !== 'height') return;
                panelEl.style.height = 'auto'; // fige ouvert
                el.classList.remove('is-animating');
                panelEl.removeEventListener('transitionend', onEnd);
                animating = false;
            };
            panelEl.addEventListener('transitionend', onEnd);
        }

        function close(el, panelEl) {
            animating = true;
            el.classList.add('is-animating');

            // auto -> valeur fixe -> 0
            panelEl.style.height = panelEl.scrollHeight + 'px';
            panelEl.style.opacity = '1';
            // force reflow
            // eslint-disable-next-line no-unused-expressions
            panelEl.offsetHeight;

            requestAnimationFrame(() => {
                panelEl.style.height = '0px';
                panelEl.style.opacity = '0';
                panelEl.classList.remove('is-open');
            });

            const onEnd = (ev) => {
                if (ev.propertyName !== 'height') return;
                el.removeAttribute('open'); // on ferme réellement à la fin
                el.classList.remove('is-animating');
                panelEl.removeEventListener('transitionend', onEnd);
                animating = false;
            };
            panelEl.addEventListener('transitionend', onEnd);
        }
    });
})();

// ===== Config WhatsApp =====
const WA_NUMBER = "590690912416"; // format international SANS +

// ===== Modale RSVP =====
(() => {
    const modal = document.getElementById('rsvp-modal');
    const openBtn = document.getElementById('rsvp-open');
    const closeEls = modal?.querySelectorAll('[data-close]');
    const form = document.getElementById('rsvp-form');
    const inputName = document.getElementById('rsvp-name');
    const selectMsg = document.getElementById('rsvp-msg');

    if (!modal || !openBtn || !form) return;

    let lastFocus = null;

    function openModal() {
        lastFocus = document.activeElement;
        modal.classList.remove('is-closing');
        modal.classList.add('is-open');     // déclenche les transitions CSS
        // focus champ
        setTimeout(() => inputName?.focus({ preventScroll: true }), 0);
        document.addEventListener('keydown', onKey);
        document.addEventListener('focus', trapFocus, true);
    }


    function closeModal() {
        // on lance l’anim inverse puis on nettoie à la fin
        modal.classList.add('is-closing');
        modal.classList.remove('is-open');

        const dialog = modal.querySelector('.modal__dialog');
        const overlay = modal.querySelector('.modal__overlay');
        let ended = 0;
        const done = () => {
            ended++;
            if (ended < 2) return; // attendre fin overlay + boîte
            modal.classList.remove('is-closing');
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('focus', trapFocus, true);
            lastFocus?.focus?.();
        };

        dialog?.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform' || e.propertyName === 'opacity') done();
        }, { once: true });

        overlay?.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity') done();
        }, { once: true });
    }

    function onKey(e) {
        if (e.key === 'Escape') closeModal();
    }

    function trapFocus(e) {
        if (modal.getAttribute('aria-hidden') === 'true') return;
        if (!modal.contains(e.target)) {
            e.stopPropagation();
            modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
        }
    }

    openBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeEls?.forEach(el => el.addEventListener('click', closeModal));
    modal.querySelector('.modal__overlay')?.addEventListener('click', closeModal);

    // Envoi WhatsApp
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (inputName.value || '').trim();
        const msg = (selectMsg.value || '').trim();
        if (!name || !msg) return;

        const text = encodeURIComponent(`Coucou\nCest ${name}.\n${msg}.\n Merci !`);
        const url = `https://wa.me/${WA_NUMBER}?text=${text}`;
        window.open(url, '_blank', 'noopener');
        closeModal();
    });
})();