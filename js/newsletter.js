(function () {
  const REQUIRE_CONSENT = true; // set false if you decide to skip the checkbox step

  // Find the form, but bail quietly if it’s not on this page
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  const email      = document.getElementById('newsletter-email');
  const consent    = document.getElementById('newsletter-consent');
  const consentRow = document.getElementById('newsletter-consent-row');
  const submitBtn  = document.getElementById('newsletter-submit');
  const statusEl   = document.getElementById('newsletter-status');

  function show(msg, ok) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? 'var(--color-dark-slate)' : '#b00020';
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
  }

  // --- NEW: animated dots helper (minimal addition) ---
  function startDots(button, baseLabel = 'Subscribing') {
    if (!button) return () => {};
    const originalLabel = button.textContent;
    const originalWidth = button.offsetWidth;
    button.style.width = originalWidth + 'px'; // prevent layout shift while animating

    const frames = ['.', '..', '...', '....', '...', '..', '.'];
    let i = 0;
    button.textContent = baseLabel + frames[0];

    const timer = setInterval(() => {
      i = (i + 1) % frames.length;
      button.textContent = baseLabel + frames[i];
    }, 300);

    // cleanup
    return function stop(finalText = originalLabel) {
      clearInterval(timer);
      button.textContent = finalText;
      requestAnimationFrame(() => { button.style.width = ''; });
    };
  }
  // --- END new helper ---

  async function handleSubmit(e) {
    e.preventDefault();

    // basic email validation
    if (!isValidEmail(email.value)) {
      show('Please enter a valid email address.', false);
      email.focus();
      return;
    }

    // progressive consent step (first click only)
    if (REQUIRE_CONSENT && consentRow && !consentRow.classList.contains('show')) {
      consentRow.classList.add('show');
      consentRow.setAttribute('aria-hidden', 'false');
      submitBtn.textContent = 'Confirm & Subscribe';
      consent && consent.focus();
      return; // stop here on first click
    }

    // enforce consent
    if (REQUIRE_CONSENT && consent && !consent.checked) {
      show('Please confirm you agree to receive CES Tech Tips emails.', false);
      consent.focus();
      return;
    }

    // build body
    const fd = new FormData(form);

    // UI state
    submitBtn.disabled = true;
    const origLabel = submitBtn.textContent;

    // NEW: start animated dots (replaces the old single "Subscribing…" label)
    const stopDots = startDots(submitBtn, 'Subscribing');
    show('', true);

    try {
      // POST to the form's action (Azure Function)
      const res = await fetch(form.action, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' },
        // credentials: 'include' // not needed unless your endpoint uses cookies
      });

      // Try to parse JSON either way (kept exactly like your version)
      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || `Request failed: ${res.status}`;
        throw new Error(msg);
      }

      // Accept typical shapes: {status:"ok"} | {success:true} | {ok:true}
      const ok = (data && (data.status === 'ok' || data.success === true || data.ok === true)) || res.ok;

      if (ok) {
        show('Thanks! Check your inbox to confirm your subscription.', true);
        form.reset();
      } else {
        show('Sorry, something went wrong. Please try again in a moment.', false);
      }
    } catch (err) {
      show(typeof err?.message === 'string' ? err.message : 'Sorry, something went wrong.', false);
    } finally {
      // NEW: stop animation and restore label
      stopDots('Subscribe');

      submitBtn.disabled = false;

      // collapse consent row after success or retry
      if (consentRow) {
        consentRow.classList.remove('show');
        consentRow.setAttribute('aria-hidden', 'true');
      }
    }
  }

  form.addEventListener('submit', handleSubmit);
})();
