/**
 * Auto Language Redirect — booking2 (φόρμα tenant)
 * ================================================
 *
 * Δύο γλώσσες μόνο:
 *   Αγγλικά : /index.html         (ρίζα)
 *   Ελληνικά: /EL/booking2.html
 *
 * Ο επισκέπτης πάει αυτόματα στη γλώσσα του browser του, από όποιο link κι
 * αν ξεκινήσει. Διατηρεί hash (#φίλτρο συνεργάτη) και query params.
 *
 * ⚠️ ΔΕΝ ΚΑΝΕΙ ΠΟΤΕ REDIRECT ΟΤΑΝ:
 *   1. Ο πελάτης ΕΠΙΣΤΡΕΦΕΙ ΑΠΟ ΠΛΗΡΩΜΗ (Viva/Stripe).
 *      ΚΡΙΣΙΜΟ: το Viva Source έχει ΣΤΑΘΕΡΟ success URL. Redirect εκείνη τη
 *      στιγμή θα έχανε τα query params και η κράτηση ΔΕΝ θα επιβεβαιωνόταν.
 *   2. Υπάρχει ?nolang (χειροκίνητη παράκαμψη).
 *   3. Ο χρήστης έχει ήδη διαλέξει γλώσσα σε αυτή τη συνεδρία.
 */
(function () {
  'use strict';

  var PAYMENT_PARAMS = [
    't', 'transactionId', 'TransactionId',
    'eventId', 'EventId',
    's', 'orderCode', 'OrderCode',
    'stripe_session_id'
  ];

  var search = window.location.search || '';

  // ── 1. ΦΡΕΝΟ ΠΛΗΡΩΜΗΣ ───────────────────────────────────────────────────
  try {
    var params = new URLSearchParams(search);
    for (var i = 0; i < PAYMENT_PARAMS.length; i++) {
      if (params.has(PAYMENT_PARAMS[i])) return;
    }
    if (params.has('nolang')) return;
  } catch (e) {
    for (var k = 0; k < PAYMENT_PARAMS.length; k++) {
      if (search.indexOf(PAYMENT_PARAMS[k] + '=') !== -1) return;
    }
    if (search.indexOf('nolang') !== -1) return;
  }

  try {
    if (sessionStorage.getItem('athenstaxi_pending_booking')) return;
    if (sessionStorage.getItem('lang_chosen')) return;
  } catch (e) {}

  // ── 2. Πού είμαστε ──────────────────────────────────────────────────────
  var path = (window.location.pathname || '/').toLowerCase();
  var isEl = path.indexOf('/el/') === 0 || path.indexOf('/el') === 0;
  var currentLang = isEl ? 'el' : 'en';

  // ── 3. Τι θέλει ο browser ───────────────────────────────────────────────
  function wantsGreek() {
    var list = [];
    if (navigator.languages && navigator.languages.length) list = navigator.languages;
    else if (navigator.language || navigator.userLanguage) list = [navigator.language || navigator.userLanguage];
    for (var i = 0; i < list.length; i++) {
      var l = String(list[i]).toLowerCase();
      if (l === 'el' || l.indexOf('el-') === 0) return true;
      // Η πρώτη αναγνωρίσιμη γλώσσα αποφασίζει: αν είναι άλλη, όχι ελληνικά.
      if (l.indexOf('en') === 0 || l.indexOf('de') === 0 || l.indexOf('fr') === 0 ||
          l.indexOf('it') === 0 || l.indexOf('es') === 0 || l.indexOf('ru') === 0) return false;
    }
    return false;
  }

  var target = wantsGreek() ? 'el' : 'en';

  function markChosen(v) {
    try { sessionStorage.setItem('lang_chosen', v); } catch (e) {}
  }

  markChosen(target);
  if (target === currentLang) return;

  var newPath = (target === 'el') ? '/EL/booking2.html' : '/index.html';
  window.location.replace(
    window.location.origin + newPath + search + (window.location.hash || '')
  );
})();

/** Σεβασμός χειροκίνητης επιλογής γλώσσας από τον switcher. */
(function () {
  'use strict';
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
    if (!a) return;
    if (!a.closest('.lang-switcher, .dropdown-content')) return;
    try { sessionStorage.setItem('lang_chosen', 'manual'); } catch (e) {}
  }, true);
})();
