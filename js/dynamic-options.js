document.addEventListener('DOMContentLoaded', function() {
    window.dynamicDataPromises = window.dynamicDataPromises || [];
    const sheetId = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=options`;

    const p = fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            const options = {};
            // Assuming first row is header
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 3) {
                    const key = row[1];
                    const value = row[2];
                    options[key] = value;
                }
            }
            applyOptions(options);
        })
        .catch(error => {
            console.error('Error fetching site options:', error);
            // Fallback to hardcoded logos if fetch fails
            const defaultLogo = "https://res.cloudinary.com/dchqvsa57/image/upload/v1780714581/saints_new_logo_lruoy4.png";
            const headerLogos = document.querySelectorAll('.logo-main, .logo-scroll, .logo-mobile');
            headerLogos.forEach(img => img.src = defaultLogo);
            
            const footerLogo = document.getElementById('footer-logo');
            if (footerLogo) footerLogo.src = defaultLogo;
        });

    window.dynamicDataPromises.push(p);

    function parseCSV(text) {
        const rows = [];
        let row = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < text.length && text[i + 1] === '"') {
                        cur += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    cur += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    row.push(cur);
                    cur = '';
                } else if (char === '\n' || char === '\r') {
                    if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
                        i++;
                    }
                    row.push(cur);
                    rows.push(row);
                    row = [];
                    cur = '';
                } else {
                    cur += char;
                }
            }
        }
        if (cur !== '' || row.length > 0) {
            row.push(cur);
            rows.push(row);
        }
        return rows;
    }

    function applyOptions(options) {
        // 1. Favicons
        if (options['apple_touch_icon']) {
            const el = document.getElementById('favicon-apple');
            if (el) el.href = options['apple_touch_icon'];
        }
        if (options['favicon_32x32']) {
            const el = document.getElementById('favicon-32');
            if (el) el.href = options['favicon_32x32'];
        }
        if (options['favicon_16x16']) {
            const el = document.getElementById('favicon-16');
            if (el) el.href = options['favicon_16x16'];
        }
        if (options['favicon_manifest']) {
            const el = document.getElementById('favicon-manifest');
            if (el) el.href = options['favicon_manifest'];
        }

        // 1.5 Logos
        if (options['logo']) {
            const headerLogos = document.querySelectorAll('.logo-main, .logo-scroll, .logo-mobile');
            headerLogos.forEach(img => img.src = options['logo']);
        }

        const footerLogo = document.getElementById('footer-logo');
        if (footerLogo) {
            if (options['footer_logo']) {
                footerLogo.src = options['footer_logo'];
            } else if (options['logo']) {
                footerLogo.src = options['logo'];
            }
        }



        // 3. Footer Left & Right Text
        // Footer text contains variables {year} and {site_fullname}
        if (options['footer_text'] && options['footer_right_text']) {
            let leftText = options['footer_text'];
            const year = new Date().getFullYear();
            leftText = leftText.replace('{year}', year);
            leftText = leftText.replace('{site_fullname}', options['site_fullname'] || '');

            const rightText = options['footer_right_text'];

            const el = document.getElementById('dynamic-footer');
            if (el) {
                el.innerHTML = `${leftText} <span class="mx-1"></span> ${rightText}`;
            }
        }
    }
});
