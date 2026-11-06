window.RSM_AGENCY_BASE=window.RSM_AGENCY_BASE||"https://rsmagency.fr/";
document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('a[data-agency]').forEach(function(a){a.href=window.RSM_AGENCY_BASE+a.getAttribute('data-agency')})});
