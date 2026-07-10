document.addEventListener('DOMContentLoaded', function() {
    window.dynamicDataPromises = window.dynamicDataPromises || [];
    
    const container = document.getElementById('organizing-committee-container');
    const advisorsContainer = document.getElementById('advisors-container');
    if (!container && !advisorsContainer) return;

    const sheetId = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=organizing_committee`;

    const fetchPromise = fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split('\n').filter(line => line.trim().length > 0);
            if (lines.length <= 1) {
                if (container) container.innerHTML = '<div class="col-12 text-center text-white">No committee members found.</div>';
                if (advisorsContainer) advisorsContainer.innerHTML = '<div class="col-12 text-center text-white">No advisors found.</div>';
                return;
            }

            // Remove header
            lines.shift();
            
            let htmlCommittee = '';
            let htmlAdvisors = '';

            lines.forEach((line) => {
                // Parse CSV properly handling quotes
                const row = [];
                let inQuotes = false;
                let currentItem = '';
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (inQuotes) {
                        if (char === '"' && line[i+1] === '"') {
                            currentItem += '"';
                            i++; // Skip the escaped quote
                        } else if (char === '"') {
                            inQuotes = false;
                        } else {
                            currentItem += char;
                        }
                    } else {
                        if (char === '"') {
                            inQuotes = true;
                        } else if (char === ',') {
                            row.push(currentItem.trim());
                            currentItem = '';
                        } else {
                            currentItem += char;
                        }
                    }
                }
                row.push(currentItem.trim());

                if (row.length < 5) return; // Need at least 5 columns

                const id = row[0];
                const name = row[1];
                const image = row[2];
                const designation = row[3];
                const role = row[4];

                let itemHtml = '';

                if (image && image !== 'null' && image !== '') {
                    itemHtml = `
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="relative overflow-hidden h-100 rounded-1 d-flex flex-column" style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                                <div class="relative overflow-hidden">
                                    <img src="${image}" class="w-100" style="aspect-ratio: 1/1; object-fit: cover; border-bottom: 1px solid rgba(255,255,255,0.1);" alt="${name}">
                                </div>
                                <div class="p-4 relative z-2 flex-grow-1 d-flex flex-column justify-content-center text-center">
                                    <h3 class="fs-20 mb-2 text-wrap text-light">${name}</h3>
                                    ${role ? `<span class="id-color fw-bold d-block mb-2 fs-14 text-wrap">${role}</span>` : ''}
                                    <h4 class="fs-16 text-wrap text-light" style="opacity: 0.8;">${designation}</h4>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    itemHtml = `
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="relative overflow-hidden h-100 rounded-1" style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                                <div class="p-40 relative z-2 h-100 d-flex flex-column justify-content-center text-center">
                                    <h3 class="fs-20 mb-2 text-wrap text-light">${name}</h3>
                                    ${role ? `<span class="id-color fw-bold d-block mb-2 fs-14 text-wrap">${role}</span>` : ''}
                                    <h4 class="fs-16 text-wrap text-light" style="opacity: 0.8;">${designation}</h4>
                                </div>
                            </div>
                        </div>
                    `;
                }

                if (role && role.trim().toLowerCase() === 'advisor') {
                    htmlAdvisors += itemHtml;
                } else {
                    htmlCommittee += itemHtml;
                }
            });

            if (container) container.innerHTML = htmlCommittee || '<div class="col-12 text-center text-white">No committee members found.</div>';
            if (advisorsContainer) advisorsContainer.innerHTML = htmlAdvisors || '<div class="col-12 text-center text-white">No advisors found.</div>';
        })
        .catch(error => {
            console.error('Error loading organizing committee:', error);
            if (container) container.innerHTML = '<div class="col-12 text-center text-danger">Failed to load committee members.</div>';
            if (advisorsContainer) advisorsContainer.innerHTML = '<div class="col-12 text-center text-danger">Failed to load advisors.</div>';
        });

    window.dynamicDataPromises.push(fetchPromise);
});
