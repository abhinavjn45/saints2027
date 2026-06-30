document.addEventListener('DOMContentLoaded', function() {
    window.dynamicDataPromises = window.dynamicDataPromises || [];
    
    const container = document.getElementById('welcome-messages-container');
    if (!container) return;

    // We fetch from the Google Viz API using the sheetId
    const sheetId = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=welcome_messages`;

    const p = fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(csvText => {
            const rows = parseCSV(csvText);
            let html = '';
            let activeIndex = 0;

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 8) {
                    const text = row[1];
                    const name = row[2];
                    const role = row[3];
                    const designation = row[4];
                    const institute = row[5];
                    const image = row[6];
                    const status = row[7] ? row[7].trim().toLowerCase() : '';

                    if (status === 'active') {
                        let cleanText = text.trim();
                        let parts = cleanText.split(/<br\s*\/?>|\n/i).map(p => p.trim()).filter(p => p !== '');
                        
                        let signOff = '';
                        if (parts.length > 0) {
                            const lastPart = parts[parts.length - 1].toLowerCase();
                            if (lastPart.includes('regards') || lastPart.includes('sincerely') || lastPart.includes('yours') || parts[parts.length - 1].length < 50) {
                                signOff = parts.pop();
                            }
                        }

                        let visibleHtml = parts.join('<br><br>');

                        const isEven = (activeIndex % 2 === 0);
                        const msgId = `welcome-msg-${activeIndex}`;
                        const imageOrderClass = !isEven ? 'order-md-2' : '';
                        const textOrderClass = !isEven ? 'order-md-1' : '';
                        
                        const imageCol = `
                            <div class="col-md-4 ${imageOrderClass}">
                                <div class="relative w-100 d-inline-block pe-5 mb-4">
                                    <div class="abs bg-color w-80px h-80px rounded-1 text-center end-0 z-2 wow scaleIn">
                                        <i class="icofont-quote-left text-white fs-40 d-block pt-3"></i>
                                    </div>
                                    <img src="${image}" class="w-100 rounded-1 wow scale-in-mask" style="aspect-ratio: 378/443; object-fit: cover;" alt="${name}">
                                </div>
                                <div class="pe-5 text-center">
                                    <h4 class="mb-1">${name}</h4>
                                    ${role ? `<span class="id-color fw-bold d-block mb-1">${role}</span>` : ''}
                                    <span class="d-block">${designation}</span>
                                    <span class="d-block">${institute}</span>
                                </div>
                            </div>
                        `;

                        const textCol = `
                            <div class="col-md-8 ${textOrderClass}">
                                <h3 class="fs-20 mb-4 wow fadeInUp">
                                    “${visibleHtml}”
                                </h3>
                                <div>
                                    ${signOff ? `<span class="fst-italic d-block mt-4">${signOff}</span>` : ''}
                                </div>
                            </div>
                        `;

                        // Add mb-5 to all rows except the last one, but we don't know the last one easily.
                        // We'll just add a margin to separate them.
                        const marginClass = activeIndex > 0 ? "mt-5 pt-4" : "";

                        // Always show image first, then text
                        html += `<div class="row align-items-start g-5 ${marginClass}">${imageCol}${textCol}</div>`;

                        activeIndex++;
                    }
                }
            }

            if (html === '') {
                html = '<div class="col-12 text-center py-5">No active messages found.</div>';
            }

            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching welcome messages:', error);
            container.innerHTML = '<div class="alert alert-danger text-center">Unable to load messages at this time.</div>';
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


