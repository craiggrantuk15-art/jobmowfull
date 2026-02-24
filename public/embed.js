/**
 * JobMow Embeddable Quote Widget
 * Drop this script tag on any website to show a professional quote form.
 * 
 * Usage:
 *   <div id="jobmow-quote-widget"></div>
 *   <script src="https://YOUR_DOMAIN/embed.js" data-org="YOUR_ORG_ID"></script>
 */
(function () {
  'use strict';

  // Find the script tag to grab config
  var scripts = document.querySelectorAll('script[data-org]');
  var script = scripts[scripts.length - 1];
  var orgId = script && script.getAttribute('data-org');
  var accentColor = (script && script.getAttribute('data-accent')) || '#16a34a';
  var SUPABASE_URL = 'https://jfziizwqxldbofwijzne.supabase.co';
  var API_URL = SUPABASE_URL + '/functions/v1/embed-widget?org=' + orgId;

  if (!orgId) {
    console.error('[JobMow Widget] Missing data-org attribute');
    return;
  }

  // Create container
  var container = document.getElementById('jobmow-quote-widget') || document.createElement('div');
  if (!container.id) {
    container.id = 'jobmow-quote-widget';
    script.parentNode.insertBefore(container, script);
  }

  // Widget state
  var config = null;
  var step = 0; // 0=service, 1=details, 2=quote+contact, 3=success
  var formData = {
    serviceId: '',
    serviceName: '',
    address: '',
    postcode: '',
    propertyType: 'Detached',
    lawnSize: 'Medium (100-300m\u00B2)',
    frequency: 'Fortnightly',
    extras: [],
    name: '',
    email: '',
    phone: ''
  };
  var quote = null;
  var isLoading = false;
  var error = null;

  var LAWN_SIZES = ['Small (< 100m\u00B2)', 'Medium (100-300m\u00B2)', 'Large (300-600m\u00B2)', 'Estate (600m\u00B2+)'];
  var FREQUENCIES = ['One-off', 'Weekly', 'Fortnightly', 'Monthly'];
  var PROPERTY_TYPES = ['Detached', 'Semi-Detached', 'Terraced / Townhouse', 'Commercial / Other'];

  // ──── Helpers ────
  function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    var num = parseInt(hex, 16);
    var r = Math.min(255, Math.max(0, (num >> 16) + amount));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    var b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  var accentHover = adjustColor(accentColor, -15);

  // ──── Styling ────
  function injectStyles() {
    if (document.getElementById('jm-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'jm-widget-styles';
    var W = '#jobmow-quote-widget'; // scope prefix
    style.textContent = '' +
      W + ' { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #0f172a; }' +
      W + ' * { box-sizing: border-box; margin: 0; padding: 0; }' +
      W + ' .jm-widget { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1); }' +
      W + ' .jm-header { background: linear-gradient(135deg, ' + accentColor + ', ' + accentHover + '); color: white; padding: 24px 28px; text-align: center; }' +
      W + ' .jm-header h2 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; color: white; }' +
      W + ' .jm-header p { font-size: 13px; opacity: 0.85; font-weight: 500; color: white; }' +
      W + ' .jm-progress { display: flex; padding: 16px 28px; gap: 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }' +
      W + ' .jm-progress-step { flex: 1; height: 4px; border-radius: 4px; background: #e2e8f0; transition: background 0.4s ease; }' +
      W + ' .jm-progress-step.active { background: ' + accentColor + '; }' +
      W + ' .jm-body { padding: 28px; }' +
      W + ' .jm-step { animation: jmFadeIn 0.35s ease; }' +
      '@keyframes jmFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
      W + ' .jm-step-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.3px; }' +
      W + ' .jm-step-desc { font-size: 13px; color: #64748b; margin-bottom: 20px; }' +
      W + ' .jm-services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }' +
      W + ' .jm-service-card { border: 2px solid #e2e8f0; border-radius: 10px; padding: 16px 14px; cursor: pointer; transition: all 0.2s ease; background: #ffffff; text-align: left; position: relative; }' +
      W + ' .jm-service-card:hover { border-color: ' + accentColor + '; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05); }' +
      W + ' .jm-service-card.selected { border-color: ' + accentColor + '; background: ' + accentColor + '1a; }' +
      W + ' .jm-service-card h4 { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }' +
      W + ' .jm-service-card p { font-size: 11px; color: #94a3b8; line-height: 1.4; }' +
      W + ' .jm-form-group { margin-bottom: 16px; }' +
      W + ' .jm-label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }' +
      W + ' .jm-input, ' + W + ' .jm-select { width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 600; color: #0f172a; background: #ffffff; outline: none; transition: border-color 0.2s ease; font-family: inherit; }' +
      W + ' .jm-input:focus, ' + W + ' .jm-select:focus { border-color: ' + accentColor + '; box-shadow: 0 0 0 3px ' + accentColor + '1a; }' +
      W + ' .jm-textarea { resize: vertical; min-height: 60px; }' +
      W + ' .jm-select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }' +
      W + ' .jm-row { display: flex; gap: 12px; }' +
      W + ' .jm-row > * { flex: 1; }' +
      W + ' .jm-extras-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }' +
      W + ' .jm-extra-btn { border: 2px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 12px; font-weight: 600; color: #64748b; background: #ffffff; cursor: pointer; transition: all 0.2s ease; text-align: left; font-family: inherit; }' +
      W + ' .jm-extra-btn:hover { border-color: ' + accentColor + '; }' +
      W + ' .jm-extra-btn.selected { border-color: ' + accentColor + '; background: ' + accentColor + '1a; color: ' + accentHover + '; font-weight: 700; }' +
      W + ' .jm-prop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }' +
      W + ' .jm-prop-btn { border: 2px solid #e2e8f0; border-radius: 10px; padding: 12px; font-size: 12px; font-weight: 600; color: #64748b; background: #ffffff; cursor: pointer; transition: all 0.2s ease; text-align: center; font-family: inherit; }' +
      W + ' .jm-prop-btn:hover { border-color: ' + accentColor + '; }' +
      W + ' .jm-prop-btn.selected { border-color: ' + accentColor + '; background: ' + accentColor + '1a; color: ' + accentHover + '; font-weight: 700; }' +
      W + ' .jm-actions { display: flex; gap: 10px; margin-top: 24px; }' +
      W + ' .jm-btn { padding: 14px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; }' +
      W + ' .jm-btn:disabled { opacity: 0.4; cursor: not-allowed; }' +
      W + ' .jm-btn-primary { flex: 1; background: ' + accentColor + '; color: white; box-shadow: 0 2px 8px rgba(0,0,0,.15); }' +
      W + ' .jm-btn-primary:not(:disabled):hover { background: ' + accentHover + '; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.2); }' +
      W + ' .jm-btn-primary:not(:disabled):active { transform: scale(0.97); }' +
      W + ' .jm-btn-secondary { background: transparent; color: #64748b; border: 2px solid #e2e8f0; }' +
      W + ' .jm-btn-secondary:hover { background: #f8fafc; }' +
      W + ' .jm-quote-card { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 28px; color: white; margin-bottom: 24px; position: relative; overflow: hidden; }' +
      W + ' .jm-quote-card::after { content: ""; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: ' + accentColor + '; border-radius: 50%; opacity: 0.1; }' +
      W + ' .jm-quote-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; background: ' + accentColor + '; color: white; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px; }' +
      W + ' .jm-quote-price { font-size: 48px; font-weight: 900; letter-spacing: -2px; line-height: 1; margin-bottom: 4px; color: white; }' +
      W + ' .jm-quote-price .jm-currency { font-size: 24px; font-weight: 700; color: ' + accentColor + '; vertical-align: top; margin-right: 2px; }' +
      W + ' .jm-quote-per { font-size: 14px; opacity: 0.6; font-weight: 500; color: white; }' +
      W + ' .jm-quote-meta { display: flex; gap: 16px; margin-top: 16px; }' +
      W + ' .jm-quote-meta-item { font-size: 12px; opacity: 0.7; color: white; }' +
      W + ' .jm-quote-meta-item strong { display: block; font-size: 14px; opacity: 1; font-weight: 700; }' +
      W + ' .jm-success { text-align: center; padding: 32px 20px; }' +
      W + ' .jm-success-icon { width: 64px; height: 64px; background: ' + accentColor + '1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }' +
      W + ' .jm-success-icon svg { width: 32px; height: 32px; color: ' + accentColor + '; }' +
      W + ' .jm-success h3 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }' +
      W + ' .jm-success p { font-size: 14px; color: #64748b; line-height: 1.5; }' +
      W + ' .jm-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }' +
      W + ' .jm-spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: jmSpin 0.6s linear infinite; display: inline-block; }' +
      '@keyframes jmSpin { to { transform: rotate(360deg); } }' +
      W + ' .jm-powered { text-align: center; padding: 12px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }' +
      W + ' .jm-powered a { color: ' + accentColor + '; text-decoration: none; font-weight: 700; }' +
      '@media (max-width: 480px) {' +
      W + ' .jm-body { padding: 20px; }' +
      W + ' .jm-services-grid { grid-template-columns: 1fr; }' +
      W + ' .jm-extras-grid { grid-template-columns: 1fr; }' +
      W + ' .jm-row { flex-direction: column; gap: 0; }' +
      W + ' .jm-quote-price { font-size: 40px; }' +
      '}';

    // Defensive: append to head, or body, or documentElement
    var target = document.head || document.getElementsByTagName('head')[0] || document.body || document.documentElement;
    target.appendChild(style);
  }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      var keys = Object.keys(attrs);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var v = attrs[k];
        if (v === undefined || v === null) continue;
        if (k === 'className') el.className = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'disabled' && v) el.setAttribute('disabled', 'disabled');
        else el.setAttribute(k, String(v));
      }
    }
    // Handle remaining arguments as children
    for (var j = 2; j < arguments.length; j++) {
      var child = arguments[j];
      if (child == null) continue;
      if (Array.isArray(child)) {
        for (var ci = 0; ci < child.length; ci++) {
          if (child[ci] == null) continue;
          if (typeof child[ci] === 'string' || typeof child[ci] === 'number') el.appendChild(document.createTextNode(child[ci]));
          else el.appendChild(child[ci]);
        }
      } else if (typeof child === 'string' || typeof child === 'number') {
        el.appendChild(document.createTextNode(child));
      } else {
        el.appendChild(child);
      }
    }
    return el;
  }

  // ──── Quote Calculator (Client-side) ────
  function calculateQuote() {
    if (!config) return null;
    var p = config.pricing;
    var base = p.medium, duration = 45;

    if (formData.lawnSize.indexOf('Small') !== -1) { base = p.small; duration = 30; }
    else if (formData.lawnSize.indexOf('Medium') !== -1) { base = p.medium; duration = 45; }
    else if (formData.lawnSize.indexOf('Large') !== -1) { base = p.large; duration = 90; }
    else if (formData.lawnSize.indexOf('Estate') !== -1) { base = p.estate; duration = 180; }

    var extrasTotal = 0;
    for (var i = 0; i < formData.extras.length; i++) {
      var ex = formData.extras[i];
      if (ex.indexOf('Fertilizer') !== -1) extrasTotal += p.extraFertilizer;
      if (ex.indexOf('Edging') !== -1) extrasTotal += p.extraEdging;
      if (ex.indexOf('Weeding') !== -1) extrasTotal += p.extraWeeding;
      if (ex.indexOf('Leaf') !== -1) extrasTotal += p.extraLeafCleanup;
    }

    var discount = 0;
    var subtotal = base + extrasTotal;
    if (formData.frequency === 'Weekly') discount = subtotal * (p.weeklyDiscount / 100);
    else if (formData.frequency === 'Fortnightly') discount = subtotal * (p.fortnightlyDiscount / 100);
    else if (formData.frequency === 'Monthly') discount = subtotal * (p.monthlyDiscount / 100);

    return {
      price: parseFloat((subtotal - discount).toFixed(2)),
      duration: duration,
      base: base,
      extras: extrasTotal,
      discount: parseFloat(discount.toFixed(2))
    };
  }

  // ──── Rendering ────
  function render() {
    container.innerHTML = '';
    if (!config) {
      container.appendChild(h('div', { className: 'jm-widget' },
        h('div', { className: 'jm-body', style: 'text-align:center;padding:40px' },
          h('div', { className: 'jm-spinner', style: 'margin:0 auto;border-color:rgba(0,0,0,0.15);border-top-color:' + accentColor }),
          h('p', { style: 'margin-top:12px;color:#94a3b8;font-size:13px' }, 'Loading quote form...')
        )
      ));
      return;
    }

    var widget = h('div', { className: 'jm-widget' });

    // Header
    widget.appendChild(h('div', { className: 'jm-header' },
      h('h2', null, 'Get an Instant Quote'),
      h('p', null, 'Powered by ' + config.businessName)
    ));

    // Progress
    var progress = h('div', { className: 'jm-progress' });
    for (var i = 0; i < 3; i++) {
      var cls = 'jm-progress-step' + (i <= step ? ' active' : '');
      progress.appendChild(h('div', { className: cls }));
    }
    widget.appendChild(progress);

    // Body
    var body = h('div', { className: 'jm-body' });

    if (error) {
      body.appendChild(h('div', { className: 'jm-error' }, error));
    }

    if (step === 0) {
      body.appendChild(renderStep0());
    } else if (step === 1) {
      body.appendChild(renderStep1());
    } else if (step === 2) {
      body.appendChild(renderStep2());
    } else if (step === 3) {
      body.appendChild(renderStep3());
    }

    widget.appendChild(body);

    // Powered by
    widget.appendChild(h('div', { className: 'jm-powered' },
      'Powered by ', h('a', { href: 'https://jobmow.com', target: '_blank' }, 'JobMow')
    ));

    container.appendChild(widget);
  }

  // ──── Step 0: Select Service ────
  function renderStep0() {
    var el = h('div', { className: 'jm-step' });
    el.appendChild(h('div', { className: 'jm-step-title' }, 'Select your service'));
    el.appendChild(h('div', { className: 'jm-step-desc' }, 'What help does your property need?'));

    var grid = h('div', { className: 'jm-services-grid' });
    for (var i = 0; i < config.services.length; i++) {
      (function (svc) {
        var card = h('div', {
          className: 'jm-service-card' + (formData.serviceId === svc.id ? ' selected' : ''),
          onClick: function () {
            formData.serviceId = svc.id;
            formData.serviceName = svc.name;
            step_next(1);
          }
        },
          h('h4', null, svc.name),
          h('p', null, svc.description || '')
        );
        grid.appendChild(card);
      })(config.services[i]);
    }
    el.appendChild(grid);
    return el;
  }

  // ──── Step 1: Property Details ────
  function renderStep1() {
    var el = h('div', { className: 'jm-step' });
    el.appendChild(h('div', { className: 'jm-step-title' }, 'Property Details'));
    el.appendChild(h('div', { className: 'jm-step-desc' }, 'Tell us about your property for an accurate quote.'));

    // Address
    var addressTextarea = h('textarea', {
      className: 'jm-input jm-textarea',
      placeholder: 'Enter your full property address...'
    });
    addressTextarea.value = formData.address;
    addressTextarea.addEventListener('input', function (e) { formData.address = e.target.value; });
    el.appendChild(h('div', { className: 'jm-form-group' },
      h('label', { className: 'jm-label' }, 'Address'),
      addressTextarea
    ));

    // Postcode
    var postcodeInput = h('input', {
      className: 'jm-input',
      type: 'text',
      placeholder: 'e.g. SW1A 1AA'
    });
    postcodeInput.value = formData.postcode;
    postcodeInput.addEventListener('input', function (e) { formData.postcode = e.target.value; });
    el.appendChild(h('div', { className: 'jm-form-group' },
      h('label', { className: 'jm-label' }, 'Postcode'),
      postcodeInput
    ));

    // Property type
    el.appendChild(h('div', { className: 'jm-form-group' },
      h('label', { className: 'jm-label' }, 'Property Type')
    ));
    var propGrid = h('div', { className: 'jm-prop-grid' });
    for (var i = 0; i < PROPERTY_TYPES.length; i++) {
      (function (pt) {
        propGrid.appendChild(h('button', {
          className: 'jm-prop-btn' + (formData.propertyType === pt ? ' selected' : ''),
          onClick: function () { formData.propertyType = pt; render(); }
        }, pt));
      })(PROPERTY_TYPES[i]);
    }
    el.appendChild(propGrid);

    // Lawn size + Frequency row
    var sizeSelect = h('select', { className: 'jm-select' });
    sizeSelect.addEventListener('change', function (e) { formData.lawnSize = e.target.value; });
    for (var s = 0; s < LAWN_SIZES.length; s++) {
      var opt = h('option', { value: LAWN_SIZES[s] }, LAWN_SIZES[s]);
      if (formData.lawnSize === LAWN_SIZES[s]) opt.selected = true;
      sizeSelect.appendChild(opt);
    }

    var freqSelect = h('select', { className: 'jm-select' });
    freqSelect.addEventListener('change', function (e) { formData.frequency = e.target.value; });
    for (var f = 0; f < FREQUENCIES.length; f++) {
      var fopt = h('option', { value: FREQUENCIES[f] }, FREQUENCIES[f]);
      if (formData.frequency === FREQUENCIES[f]) fopt.selected = true;
      freqSelect.appendChild(fopt);
    }

    el.appendChild(h('div', { className: 'jm-row', style: 'margin-top:16px' },
      h('div', { className: 'jm-form-group' },
        h('label', { className: 'jm-label' }, 'Area Size'),
        sizeSelect
      ),
      h('div', { className: 'jm-form-group' },
        h('label', { className: 'jm-label' }, 'Frequency'),
        freqSelect
      )
    ));

    // Extras
    el.appendChild(h('div', { className: 'jm-form-group' },
      h('label', { className: 'jm-label' }, 'Add-ons (optional)')
    ));
    var extGrid = h('div', { className: 'jm-extras-grid' });
    var extras = config.extras || [];
    for (var x = 0; x < extras.length; x++) {
      (function (exName) {
        var isSelected = formData.extras.indexOf(exName) !== -1;
        extGrid.appendChild(h('button', {
          className: 'jm-extra-btn' + (isSelected ? ' selected' : ''),
          onClick: function () {
            var idx = formData.extras.indexOf(exName);
            if (idx !== -1) {
              formData.extras.splice(idx, 1);
            } else {
              formData.extras.push(exName);
            }
            render();
          }
        }, (isSelected ? '\u2713 ' : '') + exName));
      })(extras[x]);
    }
    el.appendChild(extGrid);

    // Actions
    el.appendChild(h('div', { className: 'jm-actions' },
      h('button', { className: 'jm-btn jm-btn-secondary', onClick: function () { step_next(0); } }, '\u2190 Back'),
      h('button', {
        className: 'jm-btn jm-btn-primary',
        onClick: function () {
          if (!formData.address) {
            error = 'Please enter your property address.';
            render();
            return;
          }
          quote = calculateQuote();
          step_next(2);
        }
      }, 'Get My Quote \u2192')
    ));

    return el;
  }

  // ──── Step 2: Quote + Contact ────
  function renderStep2() {
    var el = h('div', { className: 'jm-step' });

    // Quote display
    if (quote) {
      var metaItems = [
        h('div', { className: 'jm-quote-meta-item' },
          h('strong', null, quote.duration + ' mins'),
          'Est. duration'
        ),
        h('div', { className: 'jm-quote-meta-item' },
          h('strong', null, formData.frequency),
          'Schedule'
        )
      ];
      if (quote.discount > 0) {
        metaItems.push(h('div', { className: 'jm-quote-meta-item' },
          h('strong', null, config.currency + quote.discount.toFixed(2) + ' off'),
          'Frequency discount'
        ));
      }

      var metaEl = h('div', { className: 'jm-quote-meta' });
      for (var m = 0; m < metaItems.length; m++) metaEl.appendChild(metaItems[m]);

      var qCard = h('div', { className: 'jm-quote-card' },
        h('div', { className: 'jm-quote-badge' }, 'Instant Estimate'),
        h('div', { className: 'jm-quote-price' },
          h('span', { className: 'jm-currency' }, config.currency),
          quote.price.toFixed(2)
        ),
        h('div', { className: 'jm-quote-per' }, 'per visit'),
        metaEl
      );
      el.appendChild(qCard);
    }

    el.appendChild(h('div', { className: 'jm-step-title' }, 'Your details'));
    el.appendChild(h('div', { className: 'jm-step-desc' }, 'Enter your info and we\'ll confirm your quote.'));

    // Contact form
    var nameInput = h('input', { className: 'jm-input', type: 'text', placeholder: 'John Smith' });
    nameInput.value = formData.name;
    nameInput.addEventListener('input', function (e) { formData.name = e.target.value; });

    var emailInput = h('input', { className: 'jm-input', type: 'email', placeholder: 'john@example.com' });
    emailInput.value = formData.email;
    emailInput.addEventListener('input', function (e) { formData.email = e.target.value; });

    el.appendChild(h('div', { className: 'jm-row' },
      h('div', { className: 'jm-form-group' },
        h('label', { className: 'jm-label' }, 'Full Name'),
        nameInput
      ),
      h('div', { className: 'jm-form-group' },
        h('label', { className: 'jm-label' }, 'Email'),
        emailInput
      )
    ));

    var phoneInput = h('input', { className: 'jm-input', type: 'tel', placeholder: '07XXX XXXXXX' });
    phoneInput.value = formData.phone;
    phoneInput.addEventListener('input', function (e) { formData.phone = e.target.value; });

    el.appendChild(h('div', { className: 'jm-form-group' },
      h('label', { className: 'jm-label' }, 'Phone Number'),
      phoneInput
    ));

    // Actions
    el.appendChild(h('div', { className: 'jm-actions' },
      h('button', { className: 'jm-btn jm-btn-secondary', onClick: function () { step_next(1); } }, '\u2190 Back'),
      h('button', {
        className: 'jm-btn jm-btn-primary',
        onClick: handleSubmit
      }, isLoading
        ? [h('div', { className: 'jm-spinner' }), 'Submitting...']
        : 'Request This Quote \u2713'
      )
    ));

    return el;
  }

  // ──── Step 3: Success ────
  function renderStep3() {
    var el = h('div', { className: 'jm-step' });
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20 6 9 17l-5-5');
    svg.appendChild(path);

    el.appendChild(h('div', { className: 'jm-success' },
      h('div', { className: 'jm-success-icon' }, svg),
      h('h3', null, 'Quote Requested!'),
      h('p', null, 'Thank you, ' + formData.name + '! We\'ve received your quote request and will be in touch at ' + formData.email + ' shortly.')
    ));
    return el;
  }

  function step_next(s) {
    step = s;
    error = null;
    render();
  }

  function handleSubmit() {
    if (!formData.name || !formData.email) {
      error = 'Please enter your name and email address.';
      render();
      return;
    }
    isLoading = true;
    error = null;
    render();

    var payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      postcode: formData.postcode,
      service_name: formData.serviceName,
      property_type: formData.propertyType,
      lawn_size: formData.lawnSize,
      frequency: formData.frequency,
      extras: formData.extras,
      estimated_price: quote ? quote.price : null,
      estimated_duration: quote ? quote.duration : null,
      source_url: window.location.href
    };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || data.error) {
            throw new Error(data.error || 'Failed to submit quote request');
          }
          isLoading = false;
          step = 3;
          render();
        });
      })
      .catch(function (e) {
        isLoading = false;
        error = e.message || 'Something went wrong. Please try again.';
        render();
      });
  }

  // ──── Initialize ────
  function init() {
    injectStyles();
    render(); // show loading

    // Load Google Fonts
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
      var target = document.head || document.getElementsByTagName('head')[0] || document.body || document.documentElement;
      target.appendChild(link);
    }

    fetch(API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load widget configuration');
        return res.json();
      })
      .then(function (data) {
        config = data;
        render();
      })
      .catch(function (e) {
        console.error('[JobMow Widget] Init error:', e);
        error = 'Failed to load the quote form. Please refresh.';
        render();
      });
  }

  // Wait for DOM if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
