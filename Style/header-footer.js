(function () {
    'use strict';

    const CONFIG = {
        headerContainerId: 'chobank-header',
        footerContainerId: 'chobank-footer',
        homeUrl: 'https://thekachoo.github.io/Home/index.html'
    };

    const HEADER_HTML = `
        <header class="chobank-header fade-reveal" style="animation-delay: 0.05s;">
            <div class="header-chobank-text">CHOBANK</div>
        </header>
    `;

    const FOOTER_HTML = `
        <footer class="chobank-footer fade-reveal" style="animation-delay: 0.35s;">
            <div class="footer-notice">
                <strong>FICTIONAL NOTICE</strong>
                <p>CHOBANK is a roleplay platform. No real money or assets are used. All transactions, cards, and proofs are fictional for roleplay purpose only.</p>
            </div>
            <div class="footer-contact">
                <strong class="contact-bold">THE KACHOO</strong>
                <p>Jenderal Sudirman Avenue, Lots 61–62, South Jakarta 12930, Indonesia.</p>
                <p>Official Account : <a href="https://twitter.com/thekachoo" target="_blank" rel="noopener noreferrer">@thekachoo</a></p>
                <p>Contant Person : <a href="https://twitter.com/haikachoo" target="_blank" rel="noopener noreferrer">@thekachoo</a></p>
                <p>Email : ohkachoo@gmail.com</p>
            </div>
            <div class="footer-copyright">2026 CHOBANK, Featured by The Kachoo</div>
        </footer>
    `;

    function renderHeader() {
        const container = document.getElementById(CONFIG.headerContainerId);
        if (container) {
            container.innerHTML = HEADER_HTML;
        }
    }

    function renderFooter() {
        const container = document.getElementById(CONFIG.footerContainerId);
        if (container) {
            container.innerHTML = FOOTER_HTML;
        }
    }

    function init() {
        renderHeader();
        renderFooter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ChobankHeaderFooter = {
        renderHeader,
        renderFooter,
        config: CONFIG
    };
})();
