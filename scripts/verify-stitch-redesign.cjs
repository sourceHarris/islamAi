const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');

// Run against the local Expo export. Uses an isolated Chrome profile and test-only local data.
const root = path.resolve(process.env.EXPORT_ROOT || 'exports/hidayah-v2-web');
const output = path.resolve(process.env.REVIEW_OUTPUT || 'exports/hidayah-v2-regression');
fs.mkdirSync(output, { recursive: true });
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
};
const server = http.createServer((request, response) => {
  let file = path.resolve(
    root,
    '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname),
  );
  if (!file.startsWith(root + path.sep) && file !== root) {
    response.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
    file = path.join(root, 'index.html');
  response.setHeader(
    'Content-Type',
    mime[path.extname(file)] || 'application/octet-stream',
  );
  fs.createReadStream(file).pipe(response);
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const chrome = spawn(
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--remote-debugging-port=9341',
      '--user-data-dir=' + path.join(output, 'chrome-profile'),
      'about:blank',
    ],
    { windowsHide: true, stdio: 'ignore' },
  );
  let ws;
  try {
    let tabs;
    for (let i = 0; i < 40; i++) {
      try {
        tabs = await (await fetch('http://127.0.0.1:9341/json')).json();
        break;
      } catch {
        await delay(250);
      }
    }
    if (!tabs) throw new Error('Chrome debugging endpoint did not start.');
    ws = new WebSocket(
      tabs.find((t) => t.type === 'page').webSocketDebuggerUrl,
    );
    await new Promise((resolve) =>
      ws.addEventListener('open', resolve, { once: true }),
    );
    let id = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id) {
        const p = pending.get(data.id);
        if (p) {
          pending.delete(data.id);
          data.error ? p.reject(data.error) : p.resolve(data.result);
        }
      }
      if (data.method === 'Runtime.exceptionThrown')
        errors.push(
          data.params.exceptionDetails.text +
            ' ' +
            (data.params.exceptionDetails.exception?.description || ''),
        );
    });
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const key = ++id;
        pending.set(key, { resolve, reject });
        ws.send(JSON.stringify({ id: key, method, params }));
      });
    const evaluate = async (expression) =>
      (
        await send('Runtime.evaluate', {
          expression,
          returnByValue: true,
          awaitPromise: true,
        })
      ).result.value;
    await send('Page.enable');
    await send('Runtime.enable');
    const sessionScript = await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `if (localStorage.getItem('stitch_qa_run') !== ${JSON.stringify(String(Date.now()))}) { localStorage.removeItem('hidayah_dhikr_v1_preview-layout'); localStorage.setItem('stitch_qa_run', ${JSON.stringify(String(Date.now()))}); } if (!localStorage.getItem('hidayah_theme_preference')) localStorage.setItem('hidayah_theme_preference', 'system'); localStorage.setItem('hidayah_user', JSON.stringify({ name: 'Huzafia', email: 'preview@example.test', registration_number: 'preview-layout' }));`,
    });
    const results = [];
    for (const [width, appearance] of [
      ...((process.env.INTERACTIONS_ONLY || process.env.VISUAL_ONLY)
        ? []
        : [
            [390, 'light'],
            [390, 'dark'],
            [320, 'light'],
            [320, 'dark'],
            [1024, 'light'],
            [1024, 'dark'],
          ]),
    ]) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: 844,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      await send('Emulation.setEmulatedMedia', {
        features: [
          { name: 'prefers-color-scheme', value: appearance },
          { name: 'prefers-reduced-motion', value: 'no-preference' },
        ],
      });
      for (const route of [
        '/',
        '/quran',
        '/chatbot',
        '/tracker',
        '/profile',
        '/dhikr',
        '/dua',
        '/checklist',
        '/qibla',
        '/swipecards',
      ]) {
        await send('Page.navigate', {
          url: `http://127.0.0.1:${port}${route}`,
        });
        await delay(1600);
        await evaluate('document.fonts.ready');
        const state = await evaluate(
          `({ text: document.body.innerText.slice(0, 200), overflow: document.documentElement.scrollWidth > innerWidth, background: getComputedStyle(document.body).backgroundColor })`,
        );
        const screenshot = await send('Page.captureScreenshot', {
          format: 'png',
        });
        const filename = `${route === '/' ? 'home' : route.slice(1)}-${width}-light-os-${appearance}.png`;
        fs.writeFileSync(
          path.join(output, filename),
          Buffer.from(screenshot.data, 'base64'),
        );
        results.push({
          route,
          width,
          appearance: 'light',
          systemAppearance: appearance,
          ...state,
          screenshot: filename,
        });
      }
    }

    // Capture the full primary layouts without replacing live Quran data.
    const visualChecks = [];
    const saveShot = async (filename) => {
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(output, filename), Buffer.from(shot.data, 'base64'));
    };
    for (const appearance of ['light', 'dark']) {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: appearance }] });
      for (const [route, name] of [['/', 'home'], ['/tracker', 'tracker']]) {
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
        await send('Page.navigate', { url: 'http://127.0.0.1:' + port + route });
        await delay(1400); await evaluate('document.fonts.ready');
        const fullHeight = await evaluate('Math.min(3600, Math.max(...Array.from(document.querySelectorAll("div"), el => el.scrollHeight)) + 160)');
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: fullHeight, deviceScaleFactor: 1, mobile: true });
        await delay(300); await saveShot(name + '-full-' + appearance + '.png');
        if (name === 'home') visualChecks.push({ name: 'Home Arabic is intact (' + appearance + ')', passed: await evaluate('document.body.innerText.includes("إِنَّ مَعَ الْعُسْرِ يُسْرًا")') });
      }
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 1800, deviceScaleFactor: 1, mobile: true });
      await send('Page.navigate', { url: 'http://127.0.0.1:' + port + '/quran?surah=18' });
      let loaded = false;
      for (let i = 0; i < 60; i++) { await delay(250); loaded = await evaluate('document.body.innerText.includes("AYAH 18:1")'); if (loaded) break; }
      visualChecks.push({ name: 'Live Al-Kahf loaded (' + appearance + ')', passed: loaded });
      for (let i = 0; i < 40; i++) { if (await evaluate('document.body.innerText.includes("sent down upon His Servant")')) break; await delay(250); }
      await evaluate('document.fonts.ready'); await saveShot('reader-390-' + appearance + '.png');
      if (loaded) {
        visualChecks.push({ name: 'Urdu source is accurately attributed (' + appearance + ')', passed: await evaluate('document.body.innerText.includes("FATEH MUHAMMAD JALANDHRY") && document.body.innerText.includes("اردو")') });
        visualChecks.push({ name: 'Bismillah is displayed once (' + appearance + ')', passed: await evaluate("((document.body.innerText.normalize(\"NFD\").replace(/[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]/g, \"\").replace(/\\u0671/g, \"ا\").replace(/\\u06CC/g, \"ي\").match(/بسم الله الرحمن الرحيم/g)) || []).length === 1") });
        visualChecks.push({ name: 'Live English translation is displayed (' + appearance + ')', passed: await evaluate('document.body.innerText.includes("sent down upon His Servant")') });
        visualChecks.push({ name: 'Arabic font is loaded (' + appearance + ')', passed: await evaluate('document.fonts.check("30px Amiri")') });
        const fontSizes = await evaluate(`(() => {
          const elements = [...document.querySelectorAll('[lang="ar"]')];
          const verse = elements.find(el => el.textContent.length > 90);
          const before = verse ? parseFloat(getComputedStyle(verse).fontSize) : 0;
          document.querySelector('[aria-label="Increase Arabic text size"]').click();
          return { before };
        })()`);
        await delay(120);
        const after = await evaluate(`(() => { const verse = [...document.querySelectorAll('[lang="ar"]')].find(el => el.textContent.length > 90); return verse ? parseFloat(getComputedStyle(verse).fontSize) : 0; })()`);
        visualChecks.push({ name: 'Reader font sizing works (' + appearance + ')', passed: after > fontSizes.before && fontSizes.before > 0 });
        await evaluate("document.querySelector('[aria-label=\"Toggle Urdu translation\"]').click()");
        await delay(100);
        visualChecks.push({ name: 'Urdu translation can be hidden (' + appearance + ')', passed: await evaluate('!document.body.innerText.includes("FATEH MUHAMMAD JALANDHRY")') });
        await evaluate("document.querySelector('[aria-label=\"Toggle Urdu translation\"]').click()");
        await delay(100);
        await evaluate("document.querySelector('[aria-label=\"Save Surah\"]')?.click()");
        await delay(150);
        visualChecks.push({ name: 'Surah bookmark persists (' + appearance + ')', passed: await evaluate('JSON.parse(localStorage.getItem("hidayah_saved_surahs") || "[]").includes(18)') });
      }
    }
    for (const appearance of ['light', 'dark']) {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: appearance }] });
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 1600, deviceScaleFactor: 1, mobile: true });
      await send('Page.navigate', { url: 'http://127.0.0.1:' + port + '/quran' });
      await delay(2000); await evaluate('document.fonts.ready');
      await saveShot('directory-390-' + appearance + '.png');
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await send('Page.navigate', { url: 'http://127.0.0.1:' + port + '/chatbot' });
      await delay(700); await evaluate('document.fonts.ready');
      await saveShot('chatbot-390-' + appearance + '.png');
    }
    fs.writeFileSync(path.join(output, 'visual-checks.json'), JSON.stringify(visualChecks, null, 2));
    console.log(JSON.stringify({ visualChecks }, null, 2));
    const failedVisualChecks = visualChecks.filter(check => !check.passed);
    if (failedVisualChecks.length) {
      throw new Error('Visual checks failed: ' + failedVisualChecks.map(check => check.name).join(', '));
    }

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: 'http://127.0.0.1:' + port + '/profile' }); await delay(1000);
    const appearanceChecks = [];
    appearanceChecks.push({ name: 'Requested spelling is Huzaifa', passed: await evaluate('document.body.innerText.includes("Huzaifa") && !document.body.innerText.includes("Huzafia")') });
    appearanceChecks.push({ name: 'Appearance controls were removed', passed: await evaluate('!document.querySelector(\'[aria-label="Dark theme"]\') && !document.querySelector(\'[aria-label="System theme"]\')') });
    appearanceChecks.push({ name: 'Light mode is enforced under dark OS', passed: await evaluate('getComputedStyle(document.documentElement).colorScheme === "light"') });
    fs.writeFileSync(path.join(output, 'appearance-checks.json'), JSON.stringify(appearanceChecks, null, 2));
    console.log(JSON.stringify({ appearanceChecks }, null, 2));
    if (appearanceChecks.some(check => !check.passed)) throw new Error('Appearance or name check failed.');
    if (process.env.VISUAL_ONLY) return;
    const captureDarkModal = async () => {
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: false,
      });
      fs.writeFileSync(
        path.join(output, 'dua-editor-390-dark.png'),
        Buffer.from(shot.data, 'base64'),
      );
    };
    const interactions = [];
    const go = async (route) => {
      await send('Page.navigate', { url: 'http://127.0.0.1:' + port + route });
      await delay(1000);
    };
    const assert = async (name, expression) => {
      const passed = await evaluate(expression);
      interactions.push({ name, passed });
      if (!passed) {
        console.error(
          await evaluate(
            `({ checkboxes: [...document.querySelectorAll('[role=checkbox]')].slice(0,2).map(e => e.outerHTML), text: document.body.innerText.slice(0,600) })`,
          ),
        );
        throw new Error('Failed: ' + name);
      }
    };
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: 'light' },
        { name: 'prefers-reduced-motion', value: 'no-preference' },
      ],
    });
    await go('/');
    const blurCount =
      "[...document.querySelectorAll('*')].filter(e => getComputedStyle(e).backdropFilter.includes('blur')).length";
    await assert('Glass blur is rendered', '(' + blurCount + ') > 0');
    await send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: 'light' },
        { name: 'prefers-reduced-motion', value: 'reduce' },
      ],
    });
    await delay(200);
    await assert(
      'Reduced motion uses opaque glass fallback',
      '(' + blurCount + ') === 0',
    );
    await send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: 'light' },
        { name: 'prefers-reduced-motion', value: 'no-preference' },
      ],
    });
    await go('/dhikr');
    await evaluate(`localStorage.removeItem('@spiritual_tracking_data')`);
    await evaluate(
      `document.querySelector('[aria-label^="Count Subhan"]').click()`,
    );
    await delay(100);
    await assert(
      'Dhikr increments',
      `document.body.innerText.includes('32 to your target')`,
    );
    await go('/dua');
    await evaluate(
      `[...document.querySelectorAll('[role="button"]')].find(e=>e.textContent.includes("Add New Du'a"))?.click()`,
    );
    await delay(400);
    await assert(
      'Dua editor opens',
      `!!document.querySelector('[placeholder="e.g., For My Health"]')`,
    );
    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(output, 'dua-editor-390-light.png'),
      Buffer.from(screenshot.data, 'base64'),
    );
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'dark' }],
    });
    await delay(120);
    await captureDarkModal();
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'light' }],
    });
    await evaluate(
      `document.querySelector('[aria-label="Close editor"]').click()`,
    );
    await delay(400);
    await assert(
      'Dua editor closes',
      `!document.querySelector('[placeholder="e.g., For My Health"]')`,
    );
    await go('/checklist');
    await evaluate(`document.querySelector('[role="checkbox"]').click()`);
    await delay(100);
    await assert(
      'Prayer toggles accessibly',
      `document.querySelector('[role="checkbox"]').getAttribute('aria-checked') === 'true'`,
    );
    await evaluate(
      `[...document.querySelectorAll('[role="button"]')].find(e=>e.textContent.includes("Save today's practice"))?.click()`,
    );
    await delay(400);
    await go('/');
    await assert(
      'Saved checklist appears on home',
      `document.body.innerText.includes('1 of 5 completed')`,
    );
    // Deterministic local fixtures verify presentation without sending preview messages to a backend.
    const chatFixture = await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(() => {
        const originalFetch = window.fetch.bind(window);
        window.__chatRequests = [];
        window.fetch = async (...args) => {
          const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
          if (!url || !/\\/chat$/.test(url)) return originalFetch(...args);
          window.__chatRequests.push(JSON.parse(args[1].body));
          await new Promise(resolve => setTimeout(resolve, 650));
          if (window.__chatRequests.length === 2) return new Response(JSON.stringify({ detail: 'Preview unavailable' }), { status: 503 });
          return new Response(JSON.stringify({
            reply: '**A small step**\\n\\nThis is a layout preview. Take a moment to name what feels difficult, then choose one manageable step.\\n\\nیہ صرف ڈیزائن کا ایک نمونہ ہے۔\\n\\nSources:\\n• Layout preview source',
            detected_emotion: 'neutral',
            sources: [{ citation: 'Layout preview source', source: 'preview' }, { citation: 'Layout preview source', source: 'preview' }]
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        };
      })();`,
    });
    const capture = async (name) => {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(
        path.join(output, name + '.png'),
        Buffer.from(shot.data, 'base64'),
      );
    };
    const typeQuestion = async (question) => {
      await evaluate(
        `(() => { const field = document.querySelector('[aria-label="Your question"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(field, ${JSON.stringify(question)}); field.dispatchEvent(new Event('input', { bubbles: true })); })()`,
      );
      await delay(100);
    };
    await send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: 'dark' },
        { name: 'prefers-reduced-motion', value: 'no-preference' },
      ],
    });
    await go('/chatbot');
    await assert(
      'Quiet conversation empty state',
      `document.body.innerText.includes("What's on your mind?") && !document.body.innerText.includes('Welcome to Hidayah AI')`,
    );
    await assert(
      'AI disclosure remains visible',
      `document.body.innerText.includes('AI-assisted.')`,
    );
    await evaluate(
      `[...document.querySelectorAll('[role="button"]')].find(e => e.textContent.includes('Finding patience')).click()`,
    );
    await delay(100);
    await assert(
      'Starter fills composer',
      `document.querySelector('[aria-label="Your question"]').value === 'What does the Quran say about patience?'`,
    );
    await evaluate(
      `document.querySelector('[aria-label="Send message"]').click()`,
    );
    await delay(150);
    await assert(
      'Loading state is shown',
      `document.body.innerText.includes('Preparing a response')`,
    );
    await capture('chatbot-loading-390-dark');
    await delay(800);
    await assert(
      'Reply renders without losing text',
      `document.body.innerText.includes('This is a layout preview.')`,
    );
    await assert(
      'Sources start collapsed and deduplicated',
      `document.body.innerText.includes('1 source') && !document.body.innerText.includes('Layout preview source')`,
    );
    await assert(
      'Chat request contract preserved',
      `window.__chatRequests[0].user_id === 'preview-layout' && window.__chatRequests[0].message === 'What does the Quran say about patience?'`,
    );
    await assert(
      'Composer remains reachable after a reply',
      `(() => { const button = document.querySelector('[aria-label="Send message"]'); const rect = button.getBoundingClientRect(); const atPoint = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2); return rect.top > 0 && rect.bottom < innerHeight - 80 && atPoint?.closest('[aria-label="Send message"]') === button; })()`,
    );
    await delay(250);
    await capture('chatbot-conversation-390-dark');
    await evaluate(
      `document.querySelector('[aria-label="Show sources"]').click()`,
    );
    await delay(100);
    await assert(
      'Sources expand accessibly',
      `document.querySelector('[aria-label="Hide sources"]').getAttribute('aria-expanded') === 'true' && document.body.innerText.includes('Layout preview source')`,
    );
    await capture('chatbot-sources-390-dark');
    await typeQuestion('A follow-up question for the layout preview');
    await evaluate(
      `document.querySelector('[aria-label="Send message"]').click()`,
    );
    await delay(900);
    await assert(
      'Failure gives an inline retry',
      `document.body.innerText.includes("The answer couldn't be loaded.") && [...document.querySelectorAll('[role="button"]')].some(e => e.textContent === 'Try again')`,
    );
    await capture('chatbot-retry-390-dark');
    await evaluate(
      `[...document.querySelectorAll('[role="button"]')].find(e => e.textContent === 'Try again').click()`,
    );
    await delay(900);
    await assert(
      'Retry succeeds without duplicating the question',
      `window.__chatRequests.length === 3 && !document.body.innerText.includes("The answer couldn't be loaded.") && document.body.innerText.split('A follow-up question for the layout preview').length === 2`,
    );
    await evaluate(
      `window.confirm = () => true; document.querySelector('[aria-label="New conversation"]').click()`,
    );
    await delay(150);
    await assert(
      'New conversation returns to the starting view',
      `document.body.innerText.includes("What's on your mind?") && !document.body.innerText.includes('This is a layout preview.')`,
    );
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 560,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await typeQuestion('A longer draft that needs several lines. '.repeat(8));
    await assert(
      'Composer stays within a short viewport',
      `document.querySelector('[aria-label="Send message"]').getBoundingClientRect().bottom < innerHeight - 80 && document.documentElement.scrollWidth <= innerWidth`,
    );
    await capture('chatbot-short-viewport-dark');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: 'light' },
        { name: 'prefers-reduced-motion', value: 'no-preference' },
      ],
    });
    await send('Page.removeScriptToEvaluateOnNewDocument', {
      identifier: chatFixture.identifier,
    });

    await send('Page.removeScriptToEvaluateOnNewDocument', {
      identifier: sessionScript.identifier,
    });
    await evaluate(`localStorage.removeItem('hidayah_user')`);
    await go('/login');
    await assert(
      'Sign-in renders',
      `!!document.querySelector('[aria-label="Email"]')`,
    );
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      path.join(output, 'login-390-light.png'),
      Buffer.from(screenshot.data, 'base64'),
    );
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'dark' }],
    });
    await delay(100);
    await evaluate(
      `[...document.querySelectorAll('[role="button"]')].filter(e => e.textContent === 'Login').at(-1).click()`,
    );
    await delay(100);
    await assert(
      'Sign-in error remains light under dark OS',
      `getComputedStyle(document.querySelector('[role="alert"]')).backgroundColor === 'rgb(255, 218, 214)'`,
    );
    await capture('login-error-390-dark');
    fs.writeFileSync(
      path.join(
        output,
        process.env.INTERACTIONS_ONLY ? 'interactions.json' : 'results.json',
      ),
      JSON.stringify({ results, errors, interactions }, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          screens: results.length,
          interactions,
          overflow: results.filter((r) => r.overflow),
          errors,
        },
        null,
        2,
      ),
    );
  } finally {
    ws?.close();
    chrome.kill();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  server.close();
});
