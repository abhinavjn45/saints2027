document.addEventListener('DOMContentLoaded', function() {
    window.dynamicDataPromises = window.dynamicDataPromises || [];
    
    const container = document.getElementById('track-speakers-container');
    if (!container) return;

    const currentTrack = container.getAttribute('data-track');
    if (!currentTrack) return;

    const sheetId = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=speakers`;

    const fetchPromise = fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split('\n').filter(line => line.trim().length > 0);
            if (lines.length <= 1) {
                container.innerHTML = '<div class="col-12 text-center text-white">No speakers found for this track.</div>';
                return;
            }

            // Remove header
            lines.shift();
            
            let html = '';
            let speakersFound = false;

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

                if (row.length < 6) return; // Need at least 6 columns

                const id = row[0];
                const track = row[1];
                const name = row[2];
                const affiliation = row[3];
                const image = row[4];
                const status = row[5].toLowerCase();

                if (track === currentTrack && status === 'active') {
                    speakersFound = true;
                    if (image && image !== 'null' && image !== '') {
                        html += `
                        <div class="col-lg-3">
                            <div class="hover relative rounded-1 overflow-hidden wow fadeIn scale-in-mask h-100">
                                <img src="${image}" class="w-100 hover-scale-1-1" style="aspect-ratio: 3/4; object-fit: cover;" alt="${name}">
                                <div class="abs w-100 h-100 start-0 top-0 hover-op-1 radial-gradient-color"></div>
                                <div class="abs w-100 start-0 bottom-0 z-3">
                                    <div class="bg-blur p-4 m-4 rounded-1 text-light text-center relative z-2">
                                        <a href="javascript:void(0);" class="text-light text-decoration-none d-block">
                                            <h3 class="mb-0 text-light text-wrap fs-20">${name}</h3>
                                            <span class="text-wrap d-block mt-2 fs-14">${affiliation}</span>
                                        </a>
                                    </div>
                                    <div class="gradient-edge-bottom h-100 op-8"></div>
                                </div>
                            </div>
                        </div>
                        `;
                    } else {
                        html += `
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="relative overflow-hidden h-100 border-white-op-3 rounded-1" style="background-color: rgba(255,255,255,0.05);">
                                <div class="p-40 relative z-2 h-100 d-flex flex-column justify-content-center">
                                    <div class="text-center">
                                        <h2 class="fs-20 mb-3 text-wrap">${name}</h2>
                                        <h4 class="fs-16 text-wrap">${affiliation}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                    }
                }
            });

            if (!speakersFound) {
                container.innerHTML = '<div class="col-12 text-center text-white">No active speakers found for this track.</div>';
            } else {
                container.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Error loading speakers:', error);
            container.innerHTML = '<div class="col-12 text-center text-white">Failed to load speakers.</div>';
        });

    window.dynamicDataPromises.push(fetchPromise);
});
