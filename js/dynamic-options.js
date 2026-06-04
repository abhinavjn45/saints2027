document.addEventListener('DOMContentLoaded', function() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTm9eNhOCD0-2xb0fPZyekQyVVYEsmWRQTvX1zqay2uQrqWBGfrmQhUXGRqeIxJwzcsUiaD3YMeX1NS/pub?gid=0&single=true&output=csv';

    fetch(csvUrl)
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
        .catch(error => console.error('Error fetching site options:', error));

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

        // 2. SEO Details
        if (options['seo_title']) {
            let title = options['seo_title'];
            title = title.replace('{site_fullname}', options['site_fullname'] || '');
            title = title.replace('{site_tagline}', options['site_tagline'] || '');
            const el = document.getElementById('seo-title');
            if (el) el.innerText = title;
        }
        if (options['seo_description']) {
            const el = document.getElementById('seo-description');
            if (el) el.content = options['seo_description'];
        }
        if (options['seo_keywords']) {
            const el = document.getElementById('seo-keywords');
            if (el) el.content = options['seo_keywords'];
        }
        if (options['seo_author']) {
            const el = document.getElementById('seo-author');
            if (el) el.content = options['seo_author'];
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
