jQuery(document).ready(function() {
        $(function () {
            // Month is 0-based in JavaScript Date: 0 = January
            $('#defaultCountdown').countdown({until: new Date(2027, 0, 6, 0)}); // year, month (Jan=0), date, hour
        });
});		

