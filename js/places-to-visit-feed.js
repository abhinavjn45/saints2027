(function () {
    'use strict';

    var section = document.getElementById('section-why-attend');
    var grid = document.getElementById('places-to-visit-grid');

    if (!section || !grid) {
        return;
    }

    var sheetId = section.getAttribute('data-sheet-id') || '';
    var sheetName = section.getAttribute('data-sheet-name') || 'places_to_visit';
    var directCsvUrl = section.getAttribute('data-sheet-csv-url') || '';
    var fallbackImage = 'images/misc/s3.webp';

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalize(value) {
        return String(value == null ? '' : value).trim();
    }

    function isActiveStatus(value) {
        return normalize(value).toLowerCase() === 'active';
    }

    function parseCsv(text) {
        var rows = [];
        var row = [];
        var currentValue = '';
        var insideQuotes = false;

        for (var index = 0; index < text.length; index += 1) {
            var character = text.charAt(index);
            var nextCharacter = text.charAt(index + 1);

            if (character === '"' && insideQuotes && nextCharacter === '"') {
                currentValue += '"';
                index += 1;
                continue;
            }

            if (character === '"') {
                insideQuotes = !insideQuotes;
                continue;
            }

            if (character === ',' && !insideQuotes) {
                row.push(currentValue);
                currentValue = '';
                continue;
            }

            if ((character === '\n' || character === '\r') && !insideQuotes) {
                if (character === '\r' && nextCharacter === '\n') {
                    index += 1;
                }

                row.push(currentValue);
                rows.push(row);
                row = [];
                currentValue = '';
                continue;
            }

            currentValue += character;
        }

        if (currentValue.length > 0 || row.length > 0) {
            row.push(currentValue);
            rows.push(row);
        }

        return rows;
    }

    function buildHeaders(headerRow) {
        return headerRow.map(function (header) {
            return normalize(header).toLowerCase();
        });
    }

    function rowToObject(headers, values) {
        return headers.reduce(function (result, header, index) {
            result[header] = normalize(values[index]);
            return result;
        }, {});
    }

    function isValidUrl(value) {
        var trimmed = normalize(value);

        if (!trimmed) {
            return false;
        }

        if (/^(https?:)?\/\//i.test(trimmed)) {
            return true;
        }

        return /^images\//i.test(trimmed) || /^\//.test(trimmed) || /^\.\./.test(trimmed);
    }

    function resolveLink(value) {
        var trimmed = normalize(value);

        if (!trimmed) {
            return '#';
        }

        if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
            return trimmed;
        }

        return trimmed;
    }

    function renderState(message) {
        grid.innerHTML = '<div class="col-12 text-center"><div class="py-5">' + escapeHtml(message) + '</div></div>';
    }

    function renderCards(rows) {
        var cards = rows.map(function (row) {
            var image = isValidUrl(row.ptv_image) ? row.ptv_image : fallbackImage;
            var title = row.ptv_title || 'Untitled Place';
            var description = row.ptv_desc || '';
            var link = resolveLink(row.ptv_link);
            var target = /^https?:\/\//i.test(link) ? ' target="_blank" rel="noopener noreferrer"' : '';
            var cardInner =
                '<div class="bg-dark-2 relative rounded-1 overflow-hidden hover-bg-color hover-text-light wow scale-in-mask h-100">' +
                    '<div class="abs p-40 bottom-0 z-2">' +
                        '<div class="relative wow fadeInUp">' +
                            '<h4>' + escapeHtml(title) + '</h4>' +
                            '<p class="mb-0">' + escapeHtml(description) + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="gradient-edge-bottom h-100"></div>' +
                    '<img src="' + escapeHtml(image) + '" class="w-100 hover-scale-1-1" alt="' + escapeHtml(title) + '">' +
                    '<div class="abs w-100 h-100 start-0 top-0 hover-op-1 radial-gradient-color"></div>' +
                '</div>';

            if (link && link !== '#') {
                return '<div class="col-xl-3 col-lg-4 col-md-6"><a class="d-block hover text-light h-100" href="' + escapeHtml(link) + '"' + target + '>' + cardInner + '</a></div>';
            }

            return '<div class="col-xl-3 col-lg-4 col-md-6"><div class="hover h-100">' + cardInner + '</div></div>';
        }).join('');

        grid.innerHTML = cards;
    }

    function buildCandidateUrls() {
        if (directCsvUrl) {
            return [directCsvUrl];
        }

        if (!sheetId) {
            return [];
        }

        return [
            'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(sheetId) + '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(sheetName),
            'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(sheetId) + '/export?format=csv&sheet=' + encodeURIComponent(sheetName)
        ];
    }

    async function fetchCsvText(urls) {
        var lastError = null;

        for (var index = 0; index < urls.length; index += 1) {
            var url = urls[index];

            try {
                var response = await fetch(url + (url.indexOf('?') === -1 ? '?' : '&') + '_=' + Date.now(), {
                    cache: 'no-store'
                });

                if (!response.ok) {
                    lastError = new Error('Request failed with status ' + response.status);
                    continue;
                }

                return await response.text();
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Unable to load Google Sheet data.');
    }

    async function init() {
        var urls = buildCandidateUrls();

        if (!urls.length) {
            renderState('Add a public Google Sheets CSV URL for the places_to_visit tab.');
            return;
        }

        renderState('Loading places from the sheet...');

        try {
            var csvText = await fetchCsvText(urls);
            var rows = parseCsv(csvText);

            if (!rows.length) {
                renderState('No rows were returned from the sheet.');
                return;
            }

            var headers = buildHeaders(rows[0]);
            var records = rows.slice(1).map(function (values) {
                return rowToObject(headers, values);
            }).filter(function (record) {
                return isActiveStatus(record.ptv_status) && normalize(record.ptv_title);
            });

            if (!records.length) {
                renderState('No active places were found in the sheet.');
                return;
            }

            renderCards(records);
        } catch (error) {
            renderState('Publish the places_to_visit sheet to the web so this section can load live data.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
