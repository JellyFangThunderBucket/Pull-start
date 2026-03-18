// ==UserScript==
// @name         Nuclear Ad Blocker
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Comprehensive ad blocking: network interception, DOM removal, anti-adblock bypass, YouTube skip
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // 1. BLOCKED AD DOMAINS
  // ─────────────────────────────────────────────
  const AD_DOMAINS = new Set([
    'doubleclick.net','googlesyndication.com','googleadservices.com',
    'adservice.google.com','adservice.google.co.uk','adservice.google.ca',
    'pagead2.googlesyndication.com','tpc.googlesyndication.com',
    'ads.google.com','ads.youtube.com','partner.googleadservices.com',
    'amazon-adsystem.com','assoc-amazon.com','ir-na.amazon-adsystem.com',
    'media.amazon.co.uk','ads.amazon.com',
    'ads.twitter.com','static.ads-twitter.com','syndication.twitter.com',
    'advertising.com','aol.com','adnxs.com','appnexus.com',
    'ads.appnexus.com','ib.adnxs.com','secure.adnxs.com',
    'rubiconproject.com','fastlane.rubiconproject.com','eus.rubiconproject.com',
    'optimizely.com','cdn.optimizely.com',
    'outbrain.com','widgets.outbrain.com','log.outbrain.com',
    'taboola.com','trc.taboola.com','cdn.taboola.com','syndication.taboola.com',
    'criteo.com','static.criteo.net','dis.criteo.com','bidder.criteo.com',
    'media.net','static.media.net',
    'casalemedia.com','casalemedia.com',
    'openx.net','deliveryengine.openx.com',
    'pubmatic.com','ads.pubmatic.com','image6.pubmatic.com',
    'smartadserver.com','bid.smartadserver.com',
    'yieldmo.com','cdn.yieldmo.com',
    'liveintent.com','ad.liveintent.com',
    'lijit.com','sovrn.com','ad.lijit.com',
    'sharethrough.com','native.sharethrough.com',
    'triplelift.com','tlx.3lift.com',
    'indexexchange.com','casalemedia.com',
    'spotxchange.com','spotx.tv','search.spotxchange.com',
    'videologygroup.com','ad.turn.com','turn.com',
    'yimg.com','ads.yimg.com',
    'oath.com','ads.oath.com',
    'verizonmedia.com','ads.verizonmedia.com',
    'advertising.com','adtech.de',
    'moatads.com','z.moatads.com','px.moat.com',
    'adroll.com','d.adroll.com','s.adroll.com',
    'perfectaudience.com','tag.perfectaudience.com',
    'quantserve.com','pixel.quantserve.com','secure.quantserve.com',
    'scorecardresearch.com','sb.scorecardresearch.com',
    'bluekai.com','tags.bluekai.com',
    'exelate.com','loadm.exelate.com',
    'demdex.net','dpm.demdex.net','cm.everesttech.net',
    'omtrdc.net','metrics.omtrdc.net',
    'mookie1.com','ads.mookie1.com',
    'adsafeprotected.com','pixel.adsafeprotected.com',
    'doubleverify.com','cdn.doubleverify.com',
    'integral-platform.com','cdn.adsafeprotected.com',
    'rlcdn.com','pixel.rlcdn.com',
    'agkn.com','tag.agkn.com',
    'nexac.com','tag.nexac.com',
    'trustarc.com','consent.truste.com',
    'contextweb.com','bh.contextweb.com',
    'bidswitch.net','x.bidswitch.net',
    'rhythmone.com','ads.rhythmone.com',
    'yastatic.net','an.yandex.ru','mc.yandex.ru',
    'rambler.ru','begun.ru','adriver.ru',
    'clickunder.net','trafmag.com',
    'mgid.com','servicer.mgid.com',
    'revcontent.com','trends.revcontent.com',
    'gravity.com','widgets.gravity.com',
    'zergnet.com','syndication.zergnet.com',
    'disqusads.com','disqus.com',
    'ads.disqus.com','referrer.disqus.com',
    'propellerads.com','pads.propellerads.com',
    'popcash.net','popcash.net',
    'popads.net','www.popads.net',
    'trafficjunky.net','ads.trafficjunky.net',
    'trafficforce.com','juicyads.com',
    'exoclick.com','cdn.exoclick.com','syndication.exoclick.com',
    'trafficstars.com','adtarget.me',
    'hilltopads.net','ads.hilltopads.net',
    'richpush.co','bi.richpush.co',
    'pushcrew.com','cdn.pushcrew.com',
    'onesignal.com','cdn.onesignal.com',
    'pushwoosh.com','cp.pushwoosh.com',
    'addthis.com','s7.addthis.com','m.addthis.com',
    'sharethis.com','ws.sharethis.com',
    'addtoany.com','static.addtoany.com',
    'stickyadstv.com','cdn.stickyadstv.com',
    'spotscenered.info','cdn.spotscenered.info',
    'analytics.tiktok.com','ads.tiktok.com',
    'sc-static.net','pixel.snap.com',
    'ads.linkedin.com','snap.licdn.com','platform.linkedin.com',
    'ads.pinterest.com','ct.pinterest.com',
    'facebook.com/tr','connect.facebook.net',
    'an.facebook.com','graph.facebook.com/tr',
    'createsend.com','tracking.createsend.com',
    'kissmetrics.com','doug1izaerwt3.cloudfront.net',
    'mixpanel.com','api.mixpanel.com',
    'heap.io','heapanalytics.com','cdn.heapanalytics.com',
    'hotjar.com','static.hotjar.com','script.hotjar.com',
    'fullstory.com','rs.fullstory.com','edge.fullstory.com',
    'logrocket.com','cdn.logrocket.com',
    'mouseflow.com','cdn.mouseflow.com',
    'clarity.ms','c.clarity.ms',
    'segment.com','cdn.segment.com','api.segment.io',
    'amplitude.com','api.amplitude.com','cdn.amplitude.com',
    'chartbeat.com','static.chartbeat.com','ping.chartbeat.net',
    'parsely.com','srv.pixel.parsely.com',
    'newrelic.com','bam.nr-data.net','js-agent.newrelic.com',
    'nr-data.net','bam.nr-data.net',
    'crazyegg.com','script.crazyegg.com','heatmap.crazyegg.com',
  ]);

  function isDomainBlocked(url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return AD_DOMAINS.has(hostname) ||
        [...AD_DOMAINS].some(d => hostname === d || hostname.endsWith('.' + d));
    } catch { return false; }
  }

  // ─────────────────────────────────────────────
  // 2. NETWORK INTERCEPTION (XHR + fetch)
  // ─────────────────────────────────────────────
  const win = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  // Block fetch
  const origFetch = win.fetch;
  win.fetch = function (input, init) {
    const url = (typeof input === 'string') ? input : (input.url || '');
    if (url && isDomainBlocked(url)) {
      return Promise.reject(new TypeError('Blocked by Nuclear Ad Blocker'));
    }
    return origFetch.apply(this, arguments);
  };

  // Block XHR
  const OrigXHR = win.XMLHttpRequest;
  function PatchedXHR() {
    const xhr = new OrigXHR();
    const origOpen = xhr.open.bind(xhr);
    xhr.open = function (method, url) {
      if (url && isDomainBlocked(url)) {
        this._blocked = true;
        return;
      }
      return origOpen.apply(this, arguments);
    };
    const origSend = xhr.send.bind(xhr);
    xhr.send = function () {
      if (this._blocked) return;
      return origSend.apply(this, arguments);
    };
    return xhr;
  }
  PatchedXHR.prototype = OrigXHR.prototype;
  win.XMLHttpRequest = PatchedXHR;

  // Block navigator.sendBeacon (tracking pings)
  if (navigator.sendBeacon) {
    const origBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      if (isDomainBlocked(url)) return true;
      return origBeacon(url, data);
    };
  }

  // ─────────────────────────────────────────────
  // 3. BLOCK AD SCRIPTS VIA document.createElement
  // ─────────────────────────────────────────────
  const origCreateElement = document.createElement.bind(document);
  document.createElement = function (tag) {
    const el = origCreateElement(tag);
    if (tag.toLowerCase() === 'script') {
      const origSetSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      if (origSetSrc) {
        Object.defineProperty(el, 'src', {
          set(val) {
            if (val && isDomainBlocked(val)) {
              Object.defineProperty(el, 'src', { value: '', writable: false });
              return;
            }
            origSetSrc.set.call(el, val);
          },
          get() {
            try { return origSetSrc.get.call(el); } catch { return ''; }
          },
          configurable: true
        });
      }
    }
    if (tag.toLowerCase() === 'iframe') {
      const origSetSrc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
      if (origSetSrc) {
        Object.defineProperty(el, 'src', {
          set(val) {
            if (val && isDomainBlocked(val)) {
              el.style.display = 'none';
              el.style.width = '0';
              el.style.height = '0';
              return;
            }
            origSetSrc.set.call(el, val);
          },
          get() {
            try { return origSetSrc.get.call(el); } catch { return ''; }
          },
          configurable: true
        });
      }
    }
    return el;
  };

  // ─────────────────────────────────────────────
  // 4. BLOCK window.open POPUPS / POP-UNDERS
  // ─────────────────────────────────────────────
  const origOpen = win.open;
  win.open = function (url, target, features) {
    if (!url || url === 'about:blank') return origOpen.apply(this, arguments);
    if (isDomainBlocked(url)) return null;
    // Block pop-unders: new windows without user gesture
    if (!features || features.includes('_blank')) return null;
    return origOpen.apply(this, arguments);
  };

  // ─────────────────────────────────────────────
  // 5. CSS COSMETIC HIDING
  // ─────────────────────────────────────────────
  const COSMETIC_CSS = `
    /* ── Generic ad slot selectors ── */
    [id*="google_ads"], [id*="googleads"], [id*="google-ad"],
    [id*="dfp-ad"], [id*="dfp_ad"], [class*="dfp-ad"],
    [id*="ad-slot"], [id*="adslot"], [class*="ad-slot"],
    [id*="ad_slot"], [class*="ad_slot"],
    [id*="ad-unit"], [class*="ad-unit"], [class*="ad_unit"],
    [id*="ad-container"], [class*="ad-container"], [class*="ad_container"],
    [id*="adcontainer"], [class*="adcontainer"],
    [id*="ad-wrapper"], [class*="ad-wrapper"], [class*="ad_wrapper"],
    [id*="adwrapper"], [class*="adwrapper"],
    [id*="banner-ad"], [class*="banner-ad"], [class*="banner_ad"],
    [id*="bannerads"], [class*="bannerads"],
    [id*="leaderboard-ad"], [class*="leaderboard-ad"],
    [id*="rectangle-ad"], [class*="rectangle-ad"],
    [id*="skyscraper-ad"], [class*="skyscraper-ad"],
    [id*="sidebar-ad"], [class*="sidebar-ad"],
    [id*="top-ad"], [class*="top-ad"],
    [id*="bottom-ad"], [class*="bottom-ad"],
    [id*="inline-ad"], [class*="inline-ad"],
    [id*="interstitial"], [class*="interstitial"],
    [id*="overlay-ad"], [class*="overlay-ad"],
    [id*="popup-ad"], [class*="popup-ad"],
    [id*="sticky-ad"], [class*="sticky-ad"],
    [id*="floating-ad"], [class*="floating-ad"],
    [class*="adsense"], [id*="adsense"],
    [class*="adsbygoogle"], [id*="adsbygoogle"],
    ins.adsbygoogle,
    /* ── Taboola / Outbrain / MGID ── */
    [id*="taboola"], [class*="taboola"],
    [id*="outbrain"], [class*="outbrain"],
    [id*="mgid"], [class*="mgid"],
    [id*="revcontent"], [class*="revcontent"],
    [id*="zergnet"], [class*="zergnet"],
    /* ── Sponsored content labels ── */
    [class*="sponsored"], [id*="sponsored"],
    [class*="advertisement"], [id*="advertisement"],
    [class*="advertorial"], [id*="advertorial"],
    [aria-label="Advertisement"], [aria-label="Sponsored"],
    [data-ad], [data-ad-unit], [data-ad-slot], [data-ad-client],
    [data-adunit], [data-adslot],
    /* ── Common iframe ad wrappers ── */
    iframe[src*="doubleclick.net"],
    iframe[src*="googlesyndication.com"],
    iframe[src*="adnxs.com"],
    iframe[src*="rubiconproject.com"],
    iframe[src*="moatads.com"],
    iframe[src*="advertising.com"],
    iframe[src*="taboola.com"],
    iframe[src*="outbrain.com"],
    /* ── Cookie / GDPR consent walls that obscure content ── */
    [id*="cookie-wall"], [class*="cookie-wall"],
    [id*="cookie-gate"], [class*="cookie-gate"],
    [id*="paywall-overlay"], [class*="paywall-overlay"],
    /* ── Notification permission nag overlays ── */
    [id*="push-notification-dialog"]:not([class*="system"]),
    /* ── Video pre-roll wrappers ── */
    [class*="preroll"], [id*="preroll"],
    [class*="pre-roll"], [id*="pre-roll"],
    /* ── Specific site common ad placements ── */
    .ad, .ads, .advert, .adverts, .advertisement, .advertisements,
    .ad-banner, .ad-block, .ad-box, .ad-call, .ad-code, .ad-content,
    .ad-frame, .ad-image, .ad-label, .ad-link, .ad-module,
    .ad-placeholder, .ad-section, .ad-space, .ad-spot, .ad-tag,
    .ad-text, .ad-tile, .ad-zone, .adchoice, .adchoices,
    .adHolder, .adPlaceholder, .adSpace, .adSpot, .adTile,
    .adArea, .adBox, .adCall, .adFrame, .adImage,
    #ad, #ads, #advert, #advertisement,
    #ad1, #ad2, #ad3, #ad4, #ad5,
    #topAd, #bottomAd, #rightAd, #leftAd, #sidebarAd,
    #headerAd, #footerAd, #leaderAd, #rectangleAd,
    /* ── Floating elements ── */
    [style*="position:fixed"][style*="z-index"]:not([class*="nav"]):not([class*="menu"]):not([class*="header"]):not([role]),
    /* ── AdChoices icon ── */
    .adchoices-icon, .ad-choices, [class*="AdChoices"],
    [class*="adchoices"] { display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important; max-height: 0 !important; overflow: hidden !important; pointer-events: none !important; }

    /* ── Prevent blank space where ads were removed ── */
    ins.adsbygoogle[data-ad-status="unfilled"] { display: none !important; }
  `;

  GM_addStyle(COSMETIC_CSS);

  // ─────────────────────────────────────────────
  // 6. DOM ELEMENT REMOVAL (MutationObserver)
  // ─────────────────────────────────────────────
  const REMOVE_SELECTORS = [
    'ins.adsbygoogle',
    '[id*="google_ads_iframe"]',
    '[id*="google_ads_frame"]',
    'iframe[id*="google_ads"]',
    '[class*="taboola"]',
    '[class*="outbrain"]',
    '[class*="adsbygoogle"]',
    '[data-ad-client]',
    '[data-ad-slot]',
    'script[src*="googlesyndication"]',
    'script[src*="doubleclick"]',
    'script[src*="adnxs"]',
    'script[src*="taboola"]',
    'script[src*="outbrain"]',
    'script[src*="advertising.com"]',
    '[id^="div-gpt-ad"]',
    '[id^="gpt-ad"]',
    '[id*="sponsoredRow"]',
    '[data-native-ad]',
    '[data-testid*="ad"]',
    '[data-ad-rendered]',
  ];

  function removeAds(root) {
    REMOVE_SELECTORS.forEach(sel => {
      try {
        root.querySelectorAll(sel).forEach(el => el.remove());
      } catch (_) {}
    });
    // Remove iframes pointing to ad domains
    root.querySelectorAll('iframe[src]').forEach(el => {
      try {
        if (isDomainBlocked(el.src)) el.remove();
      } catch (_) {}
    });
    // Remove scripts pointing to ad domains
    root.querySelectorAll('script[src]').forEach(el => {
      try {
        if (isDomainBlocked(el.src)) el.remove();
      } catch (_) {}
    });
    // Remove images pointing to ad domains (tracking pixels etc.)
    root.querySelectorAll('img[src]').forEach(el => {
      try {
        if (isDomainBlocked(el.src)) el.remove();
      } catch (_) {}
    });
  }

  // Run immediately on current DOM
  if (document.body) removeAds(document);

  // Watch for dynamically injected ads
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        removeAds(node.ownerDocument || document);
        // Also check the node itself
        REMOVE_SELECTORS.forEach(sel => {
          try { if (node.matches(sel)) node.remove(); } catch (_) {}
        });
      }
    }
  });

  const startObserver = () => {
    observer.observe(document.documentElement || document.body, {
      childList: true, subtree: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      removeAds(document);
      startObserver();
    });
  } else {
    removeAds(document);
    startObserver();
  }

  // ─────────────────────────────────────────────
  // 7. ANTI-ADBLOCK BYPASS
  // ─────────────────────────────────────────────

  // Fake adsbygoogle so sites think ads loaded fine
  win.adsbygoogle = win.adsbygoogle || { push: () => {} };
  Object.defineProperty(win, 'adsbygoogle', {
    get: () => ({ push: () => {}, loaded: true }),
    configurable: true
  });

  // Fake googletag (GPT)
  const fakeGoogletag = {
    cmd: { push: fn => { try { fn(); } catch (_) {} } },
    display: () => {},
    defineSlot: () => fakeGoogletag,
    defineOutOfPageSlot: () => fakeGoogletag,
    pubads: () => ({
      addEventListener: () => {},
      enableSingleRequest: () => {},
      collapseEmptyDivs: () => {},
      setTargeting: () => {},
      setCentering: () => {},
      refresh: () => {},
      disableInitialLoad: () => {},
      setPrivacySettings: () => {},
    }),
    companionAds: () => ({ enableSyncLoading: () => {} }),
    enableServices: () => {},
    sizeMapping: () => ({ addSize: () => fakeGoogletag.sizeMapping(), build: () => [] }),
    addService: () => fakeGoogletag,
    setTargeting: () => fakeGoogletag,
    set: () => fakeGoogletag,
    get: () => null,
    getTargeting: () => [],
    getSlots: () => [],
  };
  if (!win.googletag || !win.googletag._real) {
    win.googletag = fakeGoogletag;
  }

  // Fake pbjs (Prebid.js header bidding)
  win.pbjs = win.pbjs || {};
  win.pbjs.que = win.pbjs.que || [];
  win.pbjs.que.push = (fn) => { try { fn(); } catch (_) {} };
  win.pbjs.requestBids = () => {};
  win.pbjs.addAdUnits = () => {};
  win.pbjs.setConfig = () => {};

  // Fake apstag (Amazon TAM)
  win.apstag = {
    init: () => {}, fetchBids: (cfg, cb) => { if (cb) cb([]); },
    setDisplayBids: () => {}, targetingKeys: () => [],
  };

  // Hide adblock detectors by spoofing common detection methods
  // Some sites check if ad containers have offsetHeight > 0
  const origGetComputedStyle = win.getComputedStyle;
  win.getComputedStyle = function (el, pseudo) {
    const style = origGetComputedStyle.call(this, el, pseudo);
    if (el && el.id && (el.id.includes('ad') || el.id.includes('Ad'))) {
      // Return a proxy that reports normal dimensions
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'display') return 'block';
          if (prop === 'visibility') return 'visible';
          if (prop === 'opacity') return '1';
          if (prop === 'height' || prop === 'width') return '1px';
          return typeof target[prop] === 'function'
            ? target[prop].bind(target)
            : target[prop];
        }
      });
    }
    return style;
  };

  // Spoof offsetHeight/offsetWidth on common ad bait elements
  const _origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  const _origOffsetWidth  = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  const AD_BAIT_IDS = new Set(['ads','ad','advert','advertisement','banner','leaderboard']);

  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    get() {
      if (this.id && AD_BAIT_IDS.has(this.id.toLowerCase()) && _origOffsetHeight.get.call(this) === 0) return 1;
      return _origOffsetHeight.get.call(this);
    }, configurable: true
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    get() {
      if (this.id && AD_BAIT_IDS.has(this.id.toLowerCase()) && _origOffsetWidth.get.call(this) === 0) return 1;
      return _origOffsetWidth.get.call(this);
    }, configurable: true
  });

  // ─────────────────────────────────────────────
  // 8. YOUTUBE AD SKIPPER
  // ─────────────────────────────────────────────
  if (location.hostname.includes('youtube.com')) {
    const ytInterval = setInterval(() => {
      // Skip button
      const skipBtn = document.querySelector('.ytp-skip-ad-button, .ytp-ad-skip-button, button[class*="skip"]');
      if (skipBtn) skipBtn.click();

      // Mute + fast-forward video ads
      const video = document.querySelector('video');
      const adBadge = document.querySelector('.ytp-ad-badge, .ytp-ad-text, .ytp-ad-preview-text, .ad-showing');
      if (video && adBadge) {
        video.muted = true;
        if (video.duration && isFinite(video.duration)) {
          video.currentTime = video.duration;
        }
      }

      // Remove overlay ads
      ['.ytp-ad-overlay-container', '.ytp-ad-overlay-image',
       '.ytp-ad-text-overlay', '.ytp-ad-module',
       '.ytd-banner-promo-renderer', '.ytd-statement-banner-renderer',
       'ytd-display-ad-renderer', 'ytd-promoted-sparkles-web-renderer',
       'ytd-promoted-video-renderer', 'ytd-search-pyv-renderer',
       'ytd-compact-promoted-video-renderer', 'ytd-masthead-ad',
       '#masthead-ad', '#player-ads', '.ytd-ad-slot-renderer',
       'ytd-in-feed-ad-layout-renderer', '[is-ad-shown]',
      ].forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    }, 300);

    // Stop interval after page unloads (SPA navigation)
    window.addEventListener('yt-navigate-start', () => {
      clearInterval(ytInterval);
    });
  }

  // ─────────────────────────────────────────────
  // 9. TWITCH AD BYPASS (mute + skip)
  // ─────────────────────────────────────────────
  if (location.hostname.includes('twitch.tv')) {
    setInterval(() => {
      const video = document.querySelector('video');
      const adBanner = document.querySelector('[data-a-target="ad-countdown-timer"], .player-ad-notice');
      if (video && adBanner) {
        video.muted = true;
      }
      // Remove ad overlay
      document.querySelectorAll('.tw-ad-banner, [class*="ad-banner"]').forEach(el => el.remove());
    }, 500);
  }

  // ─────────────────────────────────────────────
  // 10. ANTI-TRACKING: Strip URL parameters
  // ─────────────────────────────────────────────
  const TRACKING_PARAMS = new Set([
    'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
    'utm_id','utm_source_platform','utm_creative_format','utm_marketing_tactic',
    'fbclid','gclid','gclsrc','dclid','gbraid','wbraid',
    'msclkid','twclid','ttclid','li_fat_id','mc_cid','mc_eid',
    'igshid','s_cid','mkt_tok','yclid','_openstat',
    'ref_src','ref_url','_hsenc','_hsmi','hsCtaTracking',
    'zanpid','affiliate_id','origin_channel',
  ]);

  function stripTrackingParams() {
    const url = new URL(location.href);
    let changed = false;
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) {
      history.replaceState(null, '', url.toString());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stripTrackingParams);
  } else {
    stripTrackingParams();
  }

  // ─────────────────────────────────────────────
  // 11. BLOCK RESOURCE LOADING via beforeunload trick
  //     (CSP meta tag injection at document-start)
  // ─────────────────────────────────────────────
  // Build a Content-Security-Policy meta tag to block known ad domains
  // This runs at document-start before any scripts load
  function injectCSPMeta() {
    const blocked = [...AD_DOMAINS].join(' ');
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    // Only block img-src and script-src from ad domains
    // (Blanket blocking connect-src can break legitimate site functionality)
    meta.content = `script-src 'self' 'unsafe-inline' 'unsafe-eval' * ; img-src 'self' data: blob: * ;`;
    // Note: Full CSP injection can break sites, so we rely on network intercept above instead
    // Uncomment below only if you want aggressive CSP (may break pages):
    // document.head && document.head.prepend(meta);
  }

  // ─────────────────────────────────────────────
  // 12. BLOCK PUSH NOTIFICATION PROMPTS
  // ─────────────────────────────────────────────
  if (win.Notification) {
    Object.defineProperty(win.Notification, 'permission', {
      get: () => 'denied', configurable: true
    });
    win.Notification.requestPermission = () => Promise.resolve('denied');
  }

  // ─────────────────────────────────────────────
  // 13. BLOCK OVERLAY / MODAL ADS ON SCROLL
  // ─────────────────────────────────────────────
  document.addEventListener('scroll', () => {
    document.querySelectorAll(
      '[class*="sticky-ad"], [class*="floating-ad"], [class*="overlay-ad"], ' +
      '[id*="sticky-ad"], [id*="floating-ad"], [id*="overlay-ad"]'
    ).forEach(el => el.remove());
  }, { passive: true });

  // ─────────────────────────────────────────────
  // 14. REMOVE ADS AFTER FULL PAGE LOAD
  // ─────────────────────────────────────────────
  window.addEventListener('load', () => {
    removeAds(document);
    // Re-run after a short delay for lazy-loaded ads
    setTimeout(() => removeAds(document), 1000);
    setTimeout(() => removeAds(document), 3000);
  });

  console.log('%c[Nuclear Ad Blocker] Active', 'color:#0f0;font-weight:bold;');

})();
