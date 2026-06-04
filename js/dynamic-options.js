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
        function updateOrCreateMeta(attrName, attrValue, content) {
            if (!content) return;
            let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attrName, attrValue);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        }

        function updateOrCreateLink(rel, href) {
            if (!href) return;
            let el = document.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        }

        if (options['seo_title']) {
            let title = options['seo_title'];
            title = title.replace('{site_fullname}', options['site_fullname'] || '');
            title = title.replace('{site_tagline}', options['site_tagline'] || '');
            document.title = title;
        }
        
        updateOrCreateMeta('name', 'description', options['seo_description']);
        updateOrCreateMeta('name', 'keywords', options['seo_keywords']);
        updateOrCreateMeta('name', 'author', options['seo_author']);
        updateOrCreateMeta('name', 'robots', options['seo_robots']);
        updateOrCreateLink('canonical', options['canonical_url']);

        // Open Graph
        updateOrCreateMeta('property', 'og:title', options['og_title']);
        updateOrCreateMeta('property', 'og:description', options['og_description']);
        updateOrCreateMeta('property', 'og:image', options['og_image']);
        updateOrCreateMeta('property', 'og:type', options['og_type']);
        updateOrCreateMeta('property', 'og:site_name', options['og_site_name']);
        updateOrCreateMeta('property', 'og:locale', options['og_locale']);

        // Twitter
        updateOrCreateMeta('name', 'twitter:card', options['twitter_card']);
        updateOrCreateMeta('name', 'twitter:title', options['twitter_title']);
        updateOrCreateMeta('name', 'twitter:description', options['twitter_description']);
        updateOrCreateMeta('name', 'twitter:image', options['twitter_image']);
        updateOrCreateMeta('name', 'twitter:site', options['twitter_site']);
        updateOrCreateMeta('name', 'twitter:creator', options['twitter_creator']);

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
