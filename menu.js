// =============================================
//  MENU CONFIGURATION
//  To hide a page from the menu, set hidden: true
//  To remove a page entirely, delete its line
// =============================================

// =============================================
//  FOOTER CONFIGURATION
// =============================================
const FOOTER_TEXT = 'إعداد وتصميم: م. أنس بن سعود السياط';
const WHATSAPP_LINK = 'https://wa.me/qr/MXNHVWH6YIENA1';

const MENU_ITEMS = [
    { label: 'الرئيسية', href: 'index.html' },
    { label: 'شجرة الأسرة', href: 'tree.html' },
    { label: 'نبذة عن الأسرة', href: 'about.html', hidden: true },
    { label: 'تمرة السياطية', href: 'dates.html', hidden: true },
    { label: 'إحصائيات', href: 'statistics.html' },
    { label: 'الوفيات', href: 'deceased.html' },
    { label: 'شبات الأسرة', href: 'shabat.html', hidden: true },
];

document.addEventListener('DOMContentLoaded', function () {
    const isIntroPage = document.body.classList.contains('intro-page');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // ── Build Top Navigation Bar (skip on intro page) ──
    if (!isIntroPage) {
        const nav = document.createElement('nav');
        nav.id = 'top-navbar';

        // Logo
        const logo = document.createElement('a');
        logo.href = 'index.html';
        logo.innerHTML = '<img id="navbar-logo" src="logo.png" alt="شعار أسرة السياط">';

        // Desktop links
        const links = document.createElement('div');
        links.id = 'navbar-links';

        // Mobile hamburger toggle
        const toggle = document.createElement('button');
        toggle.id = 'navbar-toggle';
        toggle.setAttribute('aria-label', 'القائمة');
        toggle.innerHTML = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>`;

        // Mobile dropdown
        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'navbar-mobile-menu';

        // Populate links
        MENU_ITEMS.forEach(item => {
            if (item.hidden) return;

            const isActive = currentPage === item.href;

            // Desktop link
            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'nav-link' + (isActive ? ' active' : '');
            a.textContent = item.label;
            links.appendChild(a);

            // Mobile link
            const ma = document.createElement('a');
            ma.href = item.href;
            ma.className = 'nav-link' + (isActive ? ' active' : '');
            ma.textContent = item.label;
            mobileMenu.appendChild(ma);
        });

        // Assemble navbar: logo (right) → links (left) → toggle (left, mobile)
        nav.appendChild(logo);
        nav.appendChild(links);
        nav.appendChild(toggle);

        // Insert at top of body
        document.body.prepend(mobileMenu);
        document.body.prepend(nav);

        // ── Mobile toggle ──
        let mobileOpen = false;

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            mobileOpen = !mobileOpen;
            if (mobileOpen) {
                mobileMenu.classList.add('open');
                // Animate: need a frame for the transition
                requestAnimationFrame(() => {
                    mobileMenu.style.opacity = '1';
                    mobileMenu.style.transform = 'translateY(0)';
                });
                toggle.innerHTML = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>`;
            } else {
                closeMobileMenu();
            }
        });

        function closeMobileMenu() {
            mobileOpen = false;
            mobileMenu.classList.remove('open');
            toggle.innerHTML = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>`;
        }

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (mobileOpen && !mobileMenu.contains(e.target) && !toggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileOpen) closeMobileMenu();
        });
    }

    // ── Inject universal footer ──
    const footer = document.querySelector('footer.bottom-footer');
    if (footer) {
        const isTreePage = window.location.pathname.endsWith('tree.html');
        const legendHTML = isTreePage ? `
            <div class="footer-legend">
                <div class="legend-item">
                    <span class="legend-swatch" style="background:#c3baa2; border: 2px solid #2c3e50;"></span>
                    <span>متوفى</span>
                </div>
               
                <div class="legend-item">
                    <svg width="20" height="20" viewBox="-10 -10 20 20" style="overflow:visible; flex-shrink:0;">
                        <circle r="8" fill="none" stroke="#8b6914" stroke-width="2">
                            <animate attributeName="r" from="8" to="16" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle r="8" fill="#8b6914" stroke="#fff" stroke-width="1.5"/>
                        <text dy="0.35em" text-anchor="middle" font-size="9px" fill="#fff">❖</text>
                    </svg>
                    <span>اضغط لعرض التفاصيل</span>
                </div>
                <div class="legend-item">
                    <svg width="20" height="20" viewBox="-10 -10 20 20" style="overflow:visible; flex-shrink:0;">
                        <circle r="8" fill="#6b8e6b" stroke="#fff" stroke-width="1.5"/>
                        <circle cx="0" cy="-2.5" r="2.8" fill="#fff"/>
                        <path d="M-4,4.5 Q-4,0.5 0,0.5 Q4,0.5 4,4.5" fill="#fff"/>
                    </svg>
                    <span>صورة شخصية</span>
                </div>
            </div>
        ` : '';

        footer.innerHTML = `
            ${legendHTML}
            <div class="footer-credit">
                <span>${FOOTER_TEXT}</span>
                <a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer" class="footer-whatsapp" aria-label="تواصل عبر واتساب" title="تواصل عبر واتساب">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                </a>
            </div>
        `;
    }
});
