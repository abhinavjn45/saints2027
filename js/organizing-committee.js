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
                        <div class="col-lg-3">
                            <div class="hover relative rounded-1 overflow-hidden wow fadeIn scale-in-mask h-100">
                                <img src="${image}" class="w-100 hover-scale-1-1" style="aspect-ratio: 3/4; object-fit: cover;" alt="${name}">
                                <div class="abs w-100 h-100 start-0 top-0 hover-op-1 radial-gradient-color"></div>
                                <div class="abs w-100 start-0 bottom-0 z-3">
                                    <div class="bg-blur p-4 m-3 rounded-1 text-light text-center relative z-2">
                                        <h3 class="mb-1 text-light fs-20 text-wrap">${name}</h3>
                                        ${role ? `<span class="id-color fw-bold d-block mb-1 fs-14 text-wrap">${role}</span>` : ''}
                                        <span class="d-block lh-sm fs-14 text-wrap">${designation}</span>
                                    </div>
                                    <div class="gradient-edge-bottom h-100 op-8"></div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    itemHtml = `
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="relative overflow-hidden h-100 border-white-op-3 rounded-1" style="background-color: rgba(255,255,255,0.05);">
                                <div class="p-40 relative z-2 h-100 d-flex flex-column justify-content-center">
                                    <div class="text-center">
                                        <h2 class="fs-20 mb-2 text-wrap">${name}</h2>
                                        ${role ? `<h3 class="id-color mb-3 fs-18 text-wrap">${role}</h3>` : ''}
                                        <h4 class="fs-16 text-wrap">${designation}</h4>
                                    </div>
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
