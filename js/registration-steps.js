document.addEventListener('DOMContentLoaded', function() {
    window.dynamicDataPromises = window.dynamicDataPromises || [];
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTm9eNhOCD0-2xb0fPZyekQyVVYEsmWRQTvX1zqay2uQrqWBGfrmQhUXGRqeIxJwzcsUiaD3YMeX1NS/pub?gid=1540904326&single=true&output=csv';

    const container = document.getElementById('registration-steps-container');
    if (!container) return;

    const p = fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            
            let html = '';
            // Assuming first row is header
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 2) {
                    const id = row[0];
                    const title = row[1];
                    const description = row[2] ? row[2].trim() : '';
                    const screenshot = row[3] ? row[3].trim() : '';

                    let imageHtml = '';
                    if (screenshot) {
                        imageHtml = `<img src="${screenshot}" class="img-fluid rounded-1 mt-4 soft-shadow" alt="Step ${i}">`;
                    }
                    
                    let descHtml = '';
                    if (description) {
                        descHtml = `<p class="mt-3 mb-0">${description}</p>`;
                    }

                    html += `
                        <div class="col-md-12">
                            <div class="relative overflow-hidden h-100 border-white-op-3 rounded-1 bg-blur">
                                <div class="gradient-edge-bottom color op-5"></div>
                                <div class="p-40 pb-50 z-2">
                                    <div class="text-center">
                                        <h3 class="fs-40 mb-3 id-color">Step ${i}</h3>
                                        <h4 class="mb-0 fw-normal text-light">${title}</h4>
                                        ${descHtml}
                                    </div>
                                    <div class="text-center">
                                        ${imageHtml}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }

            if (html === '') {
                html = '<div class="col-12"><p class="text-center">No registration steps found.</p></div>';
            }

            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching registration steps:', error);
            container.innerHTML = '<div class="col-12"><div class="alert alert-danger text-dark">Error loading steps. Please check your connection or Google Sheet.</div></div>';
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
