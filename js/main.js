// Grand Opening Balloons Near Me — shared interactivity.
document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq-q');
        b?.setAttribute('aria-expanded', 'false');
        const m = b?.querySelector('.marker');
        if (m) m.textContent = '+';
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        const m = btn.querySelector('.marker');
        if (m) m.textContent = '\u2212';
      }
    });
  });

  // Scroll-spy for homepage anchor nav links
  const sections = [...document.querySelectorAll('[data-spy]')];
  const links = [...document.querySelectorAll('.main-nav a[data-spy-link]')];
  if (sections.length && links.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '/#' + e.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // YouTube click-to-load facades
  document.querySelectorAll('.yt-facade').forEach(btn => {
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
      iframe.title = btn.dataset.title || 'Balloons Lane video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  // Order Inquiry forms: validate, then submit in-page through a hidden
  // iframe to FormSubmit. Status messages appear below the Send button.
  document.querySelectorAll('form.inquiry-form').forEach(form => {
    const status = form.querySelector('.form-status');
    const btn = form.querySelector('button[type="submit"]');
    const frame = form.querySelector('.form-frame');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let submitting = false;
    let settleTimer = null;

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status' + (kind ? ' ' + kind : '');
    }
    function markInvalid(input, bad) {
      if (!input) return;
      input.classList.toggle('field-invalid', !!bad);
      if (bad) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    function finishSuccess() {
      if (!submitting) return;
      submitting = false;
      if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
      setStatus('Thank you! Your inquiry has been submitted successfully. We will get back to you shortly.', 'success');
      form.reset();
      if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
    }

    if (frame) {
      frame.addEventListener('load', () => {
        if (!submitting) return;
        let path = '';
        try { path = frame.contentWindow.location.pathname || ''; } catch (e) { path = ''; }
        if (path.indexOf('/form-sent') !== -1) { finishSuccess(); return; }
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(finishSuccess, 1500);
      });
    }

    form.addEventListener('input', e => { markInvalid(e.target, false); });
    form.addEventListener('change', e => { markInvalid(e.target, false); });

    form.addEventListener('submit', e => {
      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) { e.preventDefault(); return; }

      const email = form.querySelector('[name="email"]');
      const date = form.querySelector('[name="event_date"]');
      const zip = form.querySelector('[name="delivery_zip"]');
      const message = form.querySelector('[name="message"]');
      const human = form.querySelector('.verify-human');
      let firstBad = null;
      let error = '';

      if (!email || !emailRe.test(email.value.trim())) { markInvalid(email, true); firstBad = firstBad || email; error = error || 'Please enter a valid email address.'; }
      if (!date || !date.value) { markInvalid(date, true); firstBad = firstBad || date; error = error || 'Please choose your event date.'; }
      if (!zip || !zip.value.trim()) { markInvalid(zip, true); firstBad = firstBad || zip; error = error || 'Please enter your delivery zip code.'; }
      if (!message || !message.value.trim()) { markInvalid(message, true); firstBad = firstBad || message; error = error || 'Please write your message.'; }
      if (!human || !human.checked) { firstBad = firstBad || human; error = 'Please verify you are human before sending.'; }

      if (firstBad) {
        e.preventDefault();
        setStatus(error, 'error');
        firstBad.focus();
        return;
      }

      submitting = true;
      setStatus('', '');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      // Safety net: never leave the button stuck on Sending.
      setTimeout(() => {
        if (submitting) {
          submitting = false;
          setStatus('Something went wrong while sending. Please try again.', 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
        }
      }, 20000);
    });
  });
});

// Mobile nav toggle
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '\u2715' : '\u2630';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '\u2630';
    }
  });
})();
