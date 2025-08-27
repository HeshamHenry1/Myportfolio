// Utils
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Year
$('#year').textContent = new Date().getFullYear();

// Nav toggle
$('#navToggle')?.addEventListener('click', () => {
  $('#navMenu').classList.toggle('open');
});

// Particles background
if (window.tsParticles) {
  tsParticles.load('tsparticles', {
    background: { color: 'transparent' },
    fpsLimit: 60,
    particles: {
      number: { value: 40 },
      color: { value: ['#65d6ff', '#7c4dff', '#22c55e'] },
      links: { enable: true, color: '#6b7280', distance: 130, opacity: 0.35 },
      move: { enable: true, speed: 1.1 },
      opacity: { value: 0.4 },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  });
}

// GSAP animations
if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.headline', { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out' });
  gsap.from('.subtitle', { y: 20, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power2.out' });
  gsap.from('.cta-group .btn', { y: 12, opacity: 0, duration: 0.6, delay: 0.2, stagger: 0.08 });

  $$('.section').forEach((el) => {
    if (el.id === 'hero') return;
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 80%' },
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power1.out',
    });
  });
}

// Typewriter utility
function typewriter(node, text, speed = 28) {
  let i = 0;
  function tick() {
    node.textContent = text.slice(0, i++);
    if (i <= text.length) requestAnimationFrame(() => setTimeout(tick, speed));
  }
  tick();
}

// About typing
const aboutText = "I'm Hesham Henry, a Software QA & Automation Test Engineer. I design reliable, maintainable test suites using Playwright, WebDriverIO, Cypress, and Selenium. I blend strong manual testing with automation best practices (POM, reusable utilities, stable selectors, CI readiness) to help teams ship with confidence.";
const aboutNode = document.getElementById('aboutTyped');
if (aboutNode) typewriter(aboutNode, aboutText);

// Job title typing (hero)
const jobNode = document.getElementById('jobTitleTyped');
const jobText = 'Software QA & Automation Test Engineer';
if (jobNode) typewriter(jobNode, jobText, 60);

// Load projects
async function loadProjects() {
  try {
    let projects;
    try {
      const res = await fetch('data/projects.json');
      projects = await res.json();
    } catch (e) {
      // Fallback: read embedded JSON from index.html
      const node = document.getElementById('projects-data');
      if (node?.textContent) projects = JSON.parse(node.textContent);
    }
    if (projects) renderProjects(projects);
  } catch (e) {
    console.error('Failed to load projects', e);
  }
}

function renderProjects(projects) {
  const grid = $('#projectsGrid');
  grid.innerHTML = '';
  grid.className = 'projects-grid';

  const byCategory = projects.reduce((acc, p) => {
    const cat = p.category || 'Other';
    (acc[cat] ||= []).push(p);
    return acc;
  }, {});

  Object.entries(byCategory).forEach(([category, items]) => {
    const header = document.createElement('h3');
    header.className = 'category-title';
    header.textContent = category;
    grid.appendChild(header);

    const row = document.createElement('div');
    row.className = 'projects-row';
    items.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'card tilt';
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">${p.icon ? `<span class=\"icon\">${p.icon}</span>` : ''}${p.title}</h3>
        </div>
        <div class="card-body">
          <p>${p.description}</p>
        </div>
        <div class="card-footer">
          ${(p.tags || []).map((t) => `<span class=\"tag\">${t}</span>`).join('')}
        </div>
      `;
      if (p.url) {
        card.addEventListener('click', () => window.open(p.url, '_blank'));
        card.style.cursor = 'pointer';
      }
      row.appendChild(card);
    });
    grid.appendChild(row);

    // collapsed by default; expand on hover or click
    header.addEventListener('mouseenter', () => header.classList.add('open'));
    // Keep open after hover until clicked again
    header.addEventListener('click', () => header.classList.toggle('open'));
  });

  // Add tilt hover effect
  $$('.tilt').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -8;
      const ry = ((x / rect.width) - 0.5) * 8;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// Load certificates feature grid
async function loadCertificates() {
  const grid = $('#certsGrid');
  if (!grid) return;
  try {
    let certs;
    try {
      const res = await fetch('data/certificates.json');
      if (res.ok) certs = await res.json();
    } catch (e) {}
    certs ||= [
      { title: 'ISTQB Foundation', desc: 'Preparing and practicing test design techniques.', emoji: '🎓' },
      { title: 'Test Automation', desc: 'Playwright, WebDriverIO, Cypress, Selenium.', emoji: '🤖' },
      { title: 'Database & SQL', desc: 'Write and validate queries, join, transactions.', emoji: '🗄️' },
    ];
    grid.innerHTML = '';
    certs.forEach((c) => {
      const item = document.createElement('article');
      item.className = 'feature';
      item.innerHTML = `
        <span class="emoji">${c.emoji || '📜'}</span>
        <div>
          <h3 class="title">${c.title}</h3>
          <p class="desc">${c.desc || ''}</p>
        </div>
      `;
      grid.appendChild(item);
    });
  } catch (e) {
    console.warn('Failed to load certificates', e);
  }
}

loadProjects();
loadCertificates();

// Mini contact form -> compose email via mailto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('cfName')?.value || '').trim();
    const email = (document.getElementById('cfEmail')?.value || '').trim();
    const message = (document.getElementById('cfMessage')?.value || '').trim();
    const subject = encodeURIComponent(`Portfolio message from ${name || 'Someone'}`);
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:heshamhenry2@gmail.com?subject=${subject}&body=${body}`;
  });
}

// AI Chat Assistant
const chatState = {
  open: false,
  key: '',
  projects: [],
};

$('#chatToggle')?.addEventListener('click', () => toggleChat(true));
$('#chatClose')?.addEventListener('click', () => toggleChat(false));
$('#openaiKey')?.addEventListener('change', (e) => (chatState.key = e.target.value.trim()));

function toggleChat(forceOpen) {
  const widget = $('#chatWidget');
  chatState.open = forceOpen ?? !chatState.open;
  widget.classList.toggle('open', chatState.open);
  widget.setAttribute('aria-hidden', String(!chatState.open));
}

const chatMessages = $('#chatMessages');
const chatForm = $('#chatForm');
const chatInput = $('#chatInput');

function addBubble(text, who = 'bot') {
  const div = document.createElement('div');
  div.className = `bubble ${who}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function localAnswer(message) {
  const msg = message.toLowerCase();
  // Basic intents
  if (/مشاريع|projects|portfolio|work/.test(msg)) {
    let projects;
    try {
      const res = await fetch('data/projects.json');
      projects = await res.json();
    } catch (e) {
      const node = document.getElementById('projects-data');
      projects = node?.textContent ? JSON.parse(node.textContent) : [];
    }
    const highlights = projects.slice(0, 5).map((p) => `- ${p.title}: ${p.description}`);
    return `عندي أمثلة على مشاريع اختبار:\n${highlights.join('\n')}`;
  }
  if (/مهارات|skills|tools/.test(msg)) {
    return 'المهارات: Manual (TestRail, Excel)، Automation (Playwright, WebDriverIO, Cypress, Selenium)، تقارير mochawesome و HTML.';
  }
  if (/تواصل|contact|email/.test(msg)) {
    return 'للتواصل: GitHub الخاص بي موجود أعلى الصفحة. أضف بريدك في قسم التواصل.';
  }
  return 'أقدر أشرح مشاريعي ومهاراتي. اسألني عن مشروع أو أداة محددة 👇';
}

async function openaiAnswer(message) {
  if (!chatState.key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chatState.key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant describing a QA engineer\'s portfolio in Arabic concisely.' },
          { role: 'user', content: message },
        ],
        temperature: 0.6,
      }),
    });
    if (!res.ok) throw new Error('OpenAI error');
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn('Falling back to local bot', e);
    return null;
  }
}

chatForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  addBubble(message, 'user');
  chatInput.value = '';
  addBubble('... جارِ التفكير', 'bot');
  const thinking = chatMessages.lastElementChild;

  let answer = await openaiAnswer(message);
  if (!answer) answer = await localAnswer(message);
  thinking.textContent = answer;
});

// Proactive introduction on load
window.addEventListener('load', async () => {
  // No auto-open; keep chat closed by default
});


