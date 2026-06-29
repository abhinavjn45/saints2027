jQuery(function () {
  var timeline = jQuery('.important-dates-carousel');

  if (!timeline.length || !jQuery.fn.owlCarousel) {
    return;
  }

  const sheetId = '1T8OY51wObS-MhN7tSpAHnSGPJ143aYBVnnUFK51E2jU';
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=important_dates`;

  window.dynamicDataPromises = window.dynamicDataPromises || [];

  const p = fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const lines = csvText.split('\n').filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        initCarousel();
        return;
      }

      // Remove header
      lines.shift();
      let itemsHtml = '';

      lines.forEach((line) => {
        const row = [];
        let inQuotes = false;
        let currentItem = '';

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (inQuotes) {
            if (char === '"' && line[i + 1] === '"') {
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

        if (row.length < 5) return;

        const title = row[1];
        const startDateStr = row[2];
        const endDateStr = row[3];
        const status = row[4].toLowerCase();

        if (status === 'active' && startDateStr) {
          const startDate = new Date(startDateStr);
          if (isNaN(startDate.getTime())) return;

          const monthShort = startDate.toLocaleString('en-US', { month: 'short' });
          const year = startDate.getFullYear();
          const monthYearDisplay = `${monthShort} ${year}`;
          
          let dateDisplay = '';
          const startMonthLong = startDate.toLocaleString('en-US', { month: 'long' });
          const startDay = startDate.getDate();
          const startYear = startDate.getFullYear();

          if (endDateStr) {
            const endDate = new Date(endDateStr);
            if (!isNaN(endDate.getTime())) {
              const endDay = endDate.getDate();
              dateDisplay = `${startMonthLong} ${startDay}–${endDay}, ${startYear}`;
            } else {
              dateDisplay = `${startMonthLong} ${startDay}, ${startYear}`;
            }
          } else {
            dateDisplay = `${startMonthLong} ${startDay}, ${startYear}`;
          }

          itemsHtml += `
            <div class="item">
                <div class="relative overflow-hidden h-100 border-white-op-3 rounded-1 bg-blur">
                    <div class="gradient-edge-bottom color op-5"></div>
                    <div class="p-40 relative z-2">
                        <div class="text-center">
                            <h2 class="fs-40 mb-0">${monthYearDisplay}</h2>
                            <h3 class="id-color mb-4">${title}</h3>
                            <h4>${dateDisplay}</h4>
                        </div>
                    </div>
                </div>
            </div>
          `;
        }
      });

      timeline.html(itemsHtml);
      initCarousel();
    })
    .catch(error => {
      console.error('Error loading important dates:', error);
      initCarousel();
    });

  window.dynamicDataPromises.push(p);

  function initCarousel() {
    timeline.owlCarousel({
      center: false,
      items: 3,
      loop: true,
      margin: 24,
      dots: false,
      nav: false,
      autoplay: true,
      autoplayTimeout: 2400,
      autoplayHoverPause: false,
      smartSpeed: 900,
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 2,
        },
        1200: {
          items: 3,
        },
      },
    });
  }
});