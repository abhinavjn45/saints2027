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
                if (row.length >= 5) {
                    const id = row[0];
                    const category = row[1];
                    const earlyBird = row[2];
                    const regular = row[3];
                    const status = row[4] ? row[4].trim().toLowerCase() : '';

                    if (status === 'active') {
                        const formatPrice = (p) => {
                            if (!p) return '-';
                            const str = p.toString().trim();
                            return str.toLowerCase().startsWith('usd') ? str : `₹${str}`;
                        };

                        html += `
                           <div class="d-flex flex-column border-bottom py-3">
                             <h5 class="mb-2">${category}</h5>
                             <div class="d-flex justify-content-between">
                               <div>
                                 <span class="op-5 fs-14">Early Bird</span>
                                 <h6 class="fw-bold text-light mb-0">${formatPrice(earlyBird)}</h6>
                               </div>
                               <div class="text-end">
                                 <span class="op-5 fs-14">Regular</span>
                                 <h6 class="fw-bold text-light mb-0">${formatPrice(regular)}</h6>
                               </div>
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
