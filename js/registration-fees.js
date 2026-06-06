document.addEventListener('DOMContentLoaded', function() {
    window.dynamicDataPromises = window.dynamicDataPromises || [];
    // TODO: Replace YOUR_GID_HERE with the actual gid of your registration_fee sheet. 
    // You can find this in your browser's address bar when you are on that sheet (e.g., #gid=123456789)
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTm9eNhOCD0-2xb0fPZyekQyVVYEsmWRQTvX1zqay2uQrqWBGfrmQhUXGRqeIxJwzcsUiaD3YMeX1NS/pub?gid=1280543095&single=true&output=csv';

    const container = document.getElementById('registration-fees-container');
    if (!container) return;

    const p = fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            
            let html = '';
            // Assuming first row is header
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 4) {
                    const id = row[0];
                    const category = row[1];
                    const price = row[2];
                    const status = row[3] ? row[3].trim().toLowerCase() : '';

                    if (status === 'active') {
                        html += `
                           <div class="d-flex align-items-center border-bottom py-3">
                             <div class="flex-grow-1">
                               <h5 class="mb-0">${category}</h5>
                             </div>
                             <div class="text-end">
                               <h5 class="fw-bold text-light mb-0">₹${price}</h5>
                             </div>
                           </div>
                        `;
                    }
                }
            }

            if (html === '') {
                html = '<p>No active registration fees found.</p>';
            }

            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching registration fees:', error);
            container.innerHTML = '<div class="alert alert-danger text-dark">Error loading fees. Please check your connection or Google Sheet.</div>';
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
});
