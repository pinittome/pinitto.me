define([], function() {
    if (typeof(config.analytics) == 'undefined' 
        || typeof(config.analytics.google) == 'undefined' 
        || !config.analytics.google) return;
console.log('analyics tracking code', config.analytics.google)

    window._gaq = window._gaq || [];
    window._gaq.push(['_setAccount', config.analytics.google]);
    window._gaq.push(['_setAllowLinker', true]);
    window._gaq.push(['_trackPageview']);
 
    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
});