document.addEventListener('DOMContentLoaded', function() {
    window.dynamicDataPromises = window.dynamicDataPromises || [];
    
    const container = document.getElementById('schedule-tabs-container');
    if (!container) return;

    const sheetId = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=schedule`;

    const fetchPromise = fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split('\n').filter(line => line.trim().length > 0);
            
            // Set up a tracking object for which tracks have schedules
            const trackHasSchedule = {
                '1': false,
                '2': false,
                '3': false,
                '4': false
            };

            if (lines.length > 1) {
                // Remove header
                lines.shift();

                lines.forEach((line) => {
                    const row = [];
                    let inQuotes = false;
                    let currentItem = '';
                    
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (inQuotes) {
                            if (char === '"' && line[i+1] === '"') {
                                currentItem += '"';
                                i++;
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

                    if (row.length < 4) return;

                    const trackId = row[1];
                    let embedUrl = row[2];
                    const status = row[3].toLowerCase();

                    if (status === 'active' && trackId) {
                        const tabLi = document.getElementById(`schedule-track-${trackId}`);
                        if (tabLi) {
                            trackHasSchedule[trackId] = true;
                            
                            if (embedUrl && !embedUrl.includes('widget=')) {
                                embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'widget=true&headers=false';
                            }
                            
                            tabLi.innerHTML = `
                                <div class="schedule-iframe-container" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px;">
                                    <iframe src="${embedUrl}" width="100%" height="800px" style="border: none; border-radius: 4px;"></iframe>
                                </div>
                            `;
                        }
                    }
                });
            }

            // Apply fallback messages for tracks that didn't get an active schedule
            for (let i = 1; i <= 4; i++) {
                if (!trackHasSchedule[i.toString()]) {
                    const tabLi = document.getElementById(`schedule-track-${i}`);
                    if (tabLi) {
                        tabLi.innerHTML = `<div class="text-center text-white py-5"><h3 class="mb-0">Schedule to be announced</h3><p class="mt-2 text-white-50">Please check back later.</p></div>`;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error loading schedules:', error);
            // Apply error message to all tracks
            for (let i = 1; i <= 4; i++) {
                const tabLi = document.getElementById(`schedule-track-${i}`);
                if (tabLi) {
                    tabLi.innerHTML = `<div class="text-center text-white py-5"><h3 class="mb-0 text-danger">Failed to load schedule</h3><p class="mt-2 text-white-50">Please try refreshing the page.</p></div>`;
                }
            }
        });

    window.dynamicDataPromises.push(fetchPromise);
});
