const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chips = (items) => `<div class="chips">${items.map((i) => `<span class="chip">${esc(i)}</span>`).join('')}</div>`;
// Fill a section without letting one missing/renamed section id crash the whole page.
const fill = (sel, html) => {
  const el = $(sel);
  if (el) el.innerHTML = html;
  else console.error(`Portfolio: no element ${sel} in index.html (section ids must be lowercase).`);
};
const social = (p, label) => p.socials.find((s) => s.label === label)?.url;

// Opens Gmail's compose window in a new tab (mailto: does nothing when no mail app is configured).
const gmailLink = (to, { subject, body = '' }) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const isExternal = (url) => /^https?:\/\//.test(url);
// Google Drive share/view links → direct-download links (skips the Drive preview page).
const resumeHref = (url) => {
  const id = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)/)?.[1];
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
};
const resumeBtn = (p, cls = 'btn') =>
  isExternal(p.resume)
    ? `<a class="${cls} resume-link" href="${esc(resumeHref(p.resume))}" target="_blank" rel="noopener">Download resume ↓</a>`
    : `<a class="${cls} resume-link" href="${esc(p.resume)}" download="${esc(p.name.replace(/\s+/g, '-'))}-Resume.pdf">Download resume ↓</a>`;

export function renderUI(p) {
  document.title = `${p.name} — ${p.role}`;
  $('#nav-logo').textContent = `${p.handle}@infra:~$`;
  const linkedin = social(p, 'LinkedIn');

  fill('#hero', `
    <div class="hero reveal">
      <div class="badges">
        ${p.openToWork ? '<span class="badge open"><i></i>Open to work</span>' : ''}
        <span class="badge">⌖ ${esc(p.location)}</span>
      </div>
      <h1>Hi, I'm <span class="grad">${esc(p.name)}</span></h1>
      <h2 class="rotator">› <span id="role-rotator"></span><span class="t-caret"></span></h2>
      <p class="lead">${esc(p.tagline)}</p>
      <div class="terminal" id="hero-term"></div>
      <div class="cta">
        <a class="btn primary shine" href="#contact">Hire me →</a>
        ${resumeBtn(p)}
        ${linkedin ? `<a class="btn ghost" href="${esc(linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ''}
      </div>
    </div>
    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">${[...p.ticker, ...p.ticker].map((t) => `<span>${esc(t)}</span>`).join('')}</div>
    </div>
    <div class="scroll-hint">scroll to deploy ↓</div>`);

  fill('#about', `
    <div class="panel reveal">
      <p class="eyebrow">About</p>
      <h2 class="title">Infrastructure that <span class="grad">heals itself.</span></h2>
      ${p.about.map((t) => `<p>${esc(t)}</p>`).join('')}
      <div class="stats">
        ${p.stats.map((s) => `<div class="stat"><strong data-count="${esc(s.value)}">${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}
      </div>
      <div class="edu">
        <span class="edu-icon">🎓</span>
        <div><strong>${esc(p.education.degree)}</strong><span>${esc(p.education.school)} · ${esc(p.education.year)}</span></div>
      </div>
    </div>`);

  fill('#ai', `
    <div class="panel wide reveal ai-panel">
      <p class="eyebrow">AI × DevOps</p>
      <h2 class="title">AI in the pipeline — <span class="grad">not just in the slides.</span></h2>
      <p>${esc(p.ai.intro)}</p>
      <div class="models">${p.ai.models.map((m) => `<span class="model">${esc(m)}</span>`).join('')}</div>
      <div class="ai-cards">
        ${p.ai.items
          .map(
            (it) => `
          <article class="ai-card">
            <div class="ai-icon">${esc(it.icon)}</div>
            <h3>${esc(it.title)}</h3>
            <p>${esc(it.text)}</p>
            <div class="flow">${it.flow.map((f) => `<span>${esc(f)}</span>`).join('<i>→</i>')}</div>
          </article>`,
          )
          .join('')}
      </div>
    </div>`);

  fill('#skills', `
    <div class="panel reveal">
      <p class="eyebrow">Skills</p>
      <h2 class="title">The toolchain <span class="grad">in orbit.</span></h2>
      <div class="skill-groups">
        ${p.skills
          .map(
            (g) => `
          <div class="skill-group" style="--c:${esc(g.color)}">
            <h3><span class="dot"></span>${esc(g.category)}</h3>
            ${chips(g.items)}
          </div>`,
          )
          .join('')}
      </div>
    </div>`);

  fill('#experience', `
    <div class="panel wide reveal">
      <p class="eyebrow">Experience</p>
      <h2 class="title">Career <span class="grad">pipeline.</span></h2>
      <div class="jobs">
        ${p.experience
          .map(
            (j) => `
          <article class="job ${j.status}">
            <div class="job-status">${j.status === 'running' ? '● running' : '✔ passed'}</div>
            <h3>${esc(j.role)} <span>@ ${esc(j.company)}</span></h3>
            <p class="job-period">${esc(j.period)}</p>
            <ul>${j.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
            ${chips(j.stack)}
          </article>`,
          )
          .join('')}
      </div>
    </div>`);

  fill('#projects', `
    <div class="panel wide reveal">
      <p class="eyebrow">Projects</p>
      <h2 class="title">Shipped to <span class="grad">production.</span></h2>
      <div class="projects">
        ${p.projects
          .map((pr) => {
            const tag = pr.repo ? 'a' : 'div';
            const attrs = pr.repo ? ` href="${esc(pr.repo)}" target="_blank" rel="noopener"` : '';
            return `
          <${tag} class="project${pr.highlight ? ' highlight' : ''}"${attrs}>
            ${pr.highlight ? '<span class="ribbon">AI</span>' : ''}
            <h3><span class="folder">▸</span> ${esc(pr.name)}</h3>
            <p>${esc(pr.description)}</p>
            ${chips(pr.tags)}
          </${tag}>`;
          })
          .join('')}
      </div>
    </div>`);

  fill('#contact', `
    <div class="panel reveal contact">
      <p class="eyebrow">Contact</p>
      <h2 class="title">Let's build something <span class="grad">reliable.</span></h2>
      <p>Open to DevOps, Infrastructure, Platform and SRE roles — remote or on-site. I usually reply within a day.</p>
      <div class="terminal window">
        <div class="window-bar"><i></i><i></i><i></i><span>${esc(p.handle)}@infra: ~/contact</span></div>
        <div class="window-body">
          <div class="t-line"><span class="t-prompt">$</span> cat contact.yaml</div>
          <div class="t-out">name: ${esc(p.name)}</div>
          <div class="t-out">email: <a href="${esc(gmailLink(p.email, p.emailTemplates.hire))}" target="_blank" rel="noopener">${esc(p.email)}</a> <button class="copy-btn" data-copy="${esc(p.email)}">copy</button></div>
          ${p.phone ? `<div class="t-out">phone: <a href="tel:${esc(p.phone.replace(/\s/g, ''))}">${esc(p.phone)}</a></div>` : ''}
          ${p.socials
            .map((s) => `<div class="t-out">${esc(s.label.toLowerCase())}: <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url.replace(/^https?:\/\//, ''))}</a></div>`)
            .join('')}
          <div class="t-out">location: ${esc(p.location)}</div>
          <div class="t-out">status: <span class="ok">${p.openToWork ? 'open to opportunities ✓' : 'happily employed'}</span></div>
          <div class="t-line"><span class="t-prompt">$</span> <span class="t-caret"></span></div>
        </div>
      </div>
      <div class="cta">
        <a class="btn primary shine" href="${esc(gmailLink(p.email, p.emailTemplates.hire))}" target="_blank" rel="noopener">Email me →</a>
        ${linkedin ? `<a class="btn" href="${esc(linkedin)}" target="_blank" rel="noopener">Connect on LinkedIn</a>` : ''}
        ${resumeBtn(p)}
      </div>
      <footer>© ${new Date().getFullYear()} ${esc(p.name)}${p.openToWork ? ' | Open to DevOps &amp; Infrastructure roles' : ''}</footer>
    </div>`);
}

export function setupContactActions(p) {
  document.querySelectorAll('.copy-btn').forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'copied ✓';
      } catch {
        btn.textContent = 'copy failed';
      }
      setTimeout(() => (btn.textContent = 'copy'), 1600);
    }),
  );

  // External links (e.g. Google Drive) are trusted as-is. For a local file, hosts usually
  // serve index.html when it's missing — so turn the buttons into a "request resume" email.
  if (p.resume && isExternal(p.resume)) return;
  const check = p.resume
    ? fetch(p.resume, { method: 'HEAD' }).then((r) => r.ok && (r.headers.get('content-type') || '').includes('pdf'))
    : Promise.resolve(false);
  check
    .catch(() => false)
    .then((hasPdf) => {
      if (hasPdf) return;
      document.querySelectorAll('.resume-link').forEach((a) => {
        a.removeAttribute('download');
        a.href = gmailLink(p.email, p.emailTemplates.resume);
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Request resume ✉';
      });
    });
}

export async function typeTerminal(el, lines) {
  for (const { cmd, out } of lines) {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = '<span class="t-prompt">$</span> <span class="t-cmd"></span><span class="t-caret"></span>';
    el.appendChild(line);
    const cmdEl = line.querySelector('.t-cmd');
    for (const ch of cmd) {
      cmdEl.textContent += ch;
      await sleep(30 + Math.random() * 45);
    }
    await sleep(250);
    line.querySelector('.t-caret').remove();
    const o = document.createElement('div');
    o.className = 't-out';
    o.textContent = out;
    el.appendChild(o);
    await sleep(400);
  }
  const end = document.createElement('div');
  end.className = 't-line';
  end.innerHTML = '<span class="t-prompt">$</span> <span class="t-caret"></span>';
  el.appendChild(end);
}

// Types and deletes each role in turn, forever.
export async function rotateRoles(el, roles) {
  for (let i = 0; ; i = (i + 1) % roles.length) {
    for (const ch of roles[i]) {
      el.textContent += ch;
      await sleep(55);
    }
    await sleep(1800);
    while (el.textContent) {
      el.textContent = el.textContent.slice(0, -1);
      await sleep(25);
    }
    await sleep(250);
  }
}

export async function runBoot(el) {
  const lines = [
    '[  OK  ] Started containerd.service',
    '[  OK  ] Started kubelet.service',
    '[  OK  ] Connected claude-skills.service',
    '[  OK  ] Reached target cluster-ready',
    '         Rendering infrastructure…',
  ];
  for (const l of lines) {
    el.textContent += l + '\n';
    await sleep(170);
  }
}

function countUp(el) {
  const m = el.dataset.count.match(/^(\d+)([+%]?)$/);
  if (!m) return;
  const target = Number(m[1]);
  const start = performance.now();
  const tick = (now) => {
    const k = Math.min((now - start) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + m[2];
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function setupReveal() {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains('visible')) return;
        e.target.classList.add('visible');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
      }),
    // threshold 0 + margin: tall panels on phones can never be 15% visible at once
    { threshold: 0, rootMargin: '0px 0px -12% 0px' },
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

export function setupCursorGlow() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const glowEl = document.createElement('div');
  glowEl.className = 'cursor-glow';
  document.body.appendChild(glowEl);
  window.addEventListener('pointermove', (e) => {
    glowEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}
