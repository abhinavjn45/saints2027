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
            let speakersByCategory = {};

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

                if (row.length < 7) return; // Need at least 7 columns now

                const id = row[0];
                const track = row[1];
                const category = row[2].trim();
                const name = row[3].trim();
                const affiliation = row[4].trim();
                const image = row[5].trim();
                const status = row[6].toLowerCase().trim();

                if (track === currentTrack && status === 'active') {
                    speakersFound = true;
                    
                    // Standardize category name for display (e.g. "Plenary Speaker" -> "Plenary Speakers")
                    let displayCategory = category;
                    if (!displayCategory.toLowerCase().endsWith('s')) displayCategory += 's';

                    if (!speakersByCategory[displayCategory]) {
                        speakersByCategory[displayCategory] = [];
                    }
                    speakersByCategory[displayCategory].push({name, affiliation, image});
                }
            });

            const orderedCategories = ["Keynote Speakers", "Plenary Speakers", "Invited Speakers"];
            
            // Add any other categories that might appear in the CSV unexpectedly
            Object.keys(speakersByCategory).forEach(cat => {
                if (!orderedCategories.includes(cat)) {
                    orderedCategories.push(cat);
                }
            });

            orderedCategories.forEach(cat => {
                if (speakersByCategory[cat] && speakersByCategory[cat].length > 0) {
                    html += `<div class="col-12 mt-4 mb-2 text-center"><h2 class="wow fadeInUp">${cat}</h2></div>`;
                    
                    speakersByCategory[cat].forEach(speaker => {
                        const {name, affiliation, image} = speaker;
                        if (image && image !== 'null' && image !== '') {
                            html += `
                            <div class="col-lg-3 col-md-6 mb-4">
                                <div class="relative overflow-hidden h-100 rounded-1 d-flex flex-column" style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                                    <div class="relative overflow-hidden">
                                        <img src="${image}" class="w-100" style="aspect-ratio: 1/1; object-fit: cover; border-bottom: 1px solid rgba(255,255,255,0.1);" alt="${name}">
                                    </div>
                                    <div class="p-4 relative z-2 flex-grow-1 d-flex flex-column justify-content-center text-center">
                                        <h3 class="fs-20 mb-3 text-wrap text-light">${name}</h3>
                                        <h4 class="fs-16 text-wrap text-light" style="opacity: 0.8;">${affiliation}</h4>
                                    </div>
                                </div>
                            </div>
                            `;
                        } else {
                            html += `
                            <div class="col-lg-3 col-md-6 mb-4">
                                <div class="relative overflow-hidden h-100 rounded-1" style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                                    <div class="p-40 relative z-2 h-100 d-flex flex-column justify-content-center text-center">
                                        <h3 class="fs-20 mb-3 text-wrap text-light">${name}</h3>
                                        <h4 class="fs-16 text-wrap text-light" style="opacity: 0.8;">${affiliation}</h4>
                                    </div>
                                </div>
                            </div>
                            `;
                        }
                    });
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
