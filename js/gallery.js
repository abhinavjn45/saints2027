// gallery.js
jQuery(document).ready(function() {
    const sheetId = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=gallery_images`;

    window.dynamicDataPromises = window.dynamicDataPromises || [];

    const fetchPromise = fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const container = document.getElementById('gallery-container');
            if (!container) return;

            const lines = csvText.split('\n').filter(line => line.trim().length > 0);
            if (lines.length <= 1) {
                container.innerHTML = '<div class="col-12 text-center text-muted">No images found.</div>';
                return;
            }

            const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
            const colId = headers.indexOf('image_id');
            const colTitle = headers.indexOf('image_title');
            const colUrl = headers.indexOf('image_url');
            const colStatus = headers.indexOf('image_status');

            if (colTitle === -1 || colUrl === -1 || colStatus === -1) {
                container.innerHTML = '<div class="col-12 text-center text-danger">Error: Missing required columns in Google Sheet.</div>';
                return;
            }

            let htmlString = '';
            
            for (let i = 1; i < lines.length; i++) {
                // Split correctly handling quoted commas
                const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
                const row = lines[i].split(regex).map(cell => cell.replace(/^"|"$/g, '').trim());

                if (row.length <= Math.max(colTitle, colUrl, colStatus)) continue;

                const status = row[colStatus].toLowerCase();
                if (status !== 'active') continue;

                const title = row[colTitle];
                const url = row[colUrl];
                const animationDelay = (0.2 + ((i - 1) % 4) * 0.2).toFixed(1); // 0.2s, 0.4s, 0.6s, 0.8s pattern

                htmlString += `
                    <div class="col-lg-4 wow fadeIn" data-wow-delay="${animationDelay}s">
                        <a href="${url}" class="d-block hover relative rounded-20 overflow-hidden text-light image-popup">
                            <img src="${url}" class="w-100 hover-scale-1-1" alt="${title}">
                            <div class="absolute start-0 bottom-0 p-4 z-2">
                                <h4>${title}</h4>
                            </div>
                            <div class="gradient-edge-bottom h-70"></div>
                        </a>
                    </div>
                `;
            }

            if (htmlString === '') {
                container.innerHTML = '<div class="col-12 text-center text-muted">No active images available.</div>';
            } else {
                container.innerHTML = htmlString;
                // Re-initialize popup if it exists
                if (jQuery('.image-popup').length > 0 && typeof jQuery('.image-popup').magnificPopup === 'function') {
                    jQuery('.image-popup').magnificPopup({
                        type: 'image',
                        gallery: {
                            enabled: true
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error loading gallery images:', error);
            const container = document.getElementById('gallery-container');
            if (container) {
                container.innerHTML = '<div class="col-12 text-center text-danger">Failed to load gallery data.</div>';
            }
        });

    window.dynamicDataPromises.push(fetchPromise);
});
