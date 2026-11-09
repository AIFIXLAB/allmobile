import { next } from '@vercel/functions';

// รหัสเข้าเว็บ ตั้งค่าใหม่ได้ที่ Vercel > Settings > Environment Variables ชื่อ SITE_PIN
const PIN = process.env.SITE_PIN || '2217';
const COOKIE = 'db_session';
const MAX_AGE = 60 * 60 * 24 * 30; // จำการเข้าสู่ระบบ 30 วัน

async function sessionToken() {
  const data = new TextEncoder().encode('droidbench|' + PIN);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

function sameText(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function loginPage(wrong) {
  return `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>DroidBench</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=IBM+Plex+Sans+Thai:wght@400;600&display=swap">
<style>
:root{--bg:#0C5A50;--via:#1B7468;--sheet:#F9FBF9;--ink:#14231F;--dim:#53665F;--line:#C8D5CE;--btn:#0C5A50;--btnink:#EAF7F1;--bad:#AE2A20;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0A3630;--via:#1B6157;--sheet:#17231F;--ink:#E2EEE8;--dim:#97ACA4;--line:#2D3F39;--btn:#5AD3BF;--btnink:#0A3630;--bad:#FF9A90;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:16px;background-color:var(--bg);background-image:radial-gradient(var(--via) 1.3px,transparent 1.6px);background-size:22px 22px;color:var(--ink);font:400 15px/1.6 "IBM Plex Sans Thai",system-ui,sans-serif}
form{width:min(340px,100%);background:var(--sheet);border-radius:8px;padding:28px;display:flex;flex-direction:column;gap:14px}
h1{font:700 28px/1.1 "Chakra Petch","IBM Plex Sans Thai",sans-serif;margin:0}
p{margin:0;color:var(--dim)}
input{width:100%;height:58px;border:1px solid var(--line);border-radius:6px;background:transparent;color:inherit;text-align:center;font:700 26px "Chakra Petch",sans-serif;letter-spacing:.35em}
button{height:48px;border:0;border-radius:6px;background:var(--btn);color:var(--btnink);font:600 16px "IBM Plex Sans Thai",sans-serif;cursor:pointer}
:focus-visible{outline:2px solid var(--btn);outline-offset:2px}
.err{color:var(--bad);font-weight:600}
</style></head><body>
<form method="post" action="/__unlock">
<h1>DroidBench</h1>
<p>ใส่รหัสเพื่อเข้าใช้งาน</p>
${wrong ? '<p class="err" role="alert">รหัสไม่ถูกต้อง ลองอีกครั้ง</p>' : ''}
<input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="16" required autofocus aria-label="รหัสเข้าใช้งาน">
<button type="submit">เข้าใช้งาน</button>
</form></body></html>`;
}

function htmlResponse(html, status) {
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  });
}

function redirectHome(cookie) {
  return new Response(null, {
    status: 303,
    headers: { location: '/', 'cache-control': 'no-store', 'set-cookie': cookie },
  });
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);
  const token = await sessionToken();

  if (pathname === '/__unlock' && request.method === 'POST') {
    const form = new URLSearchParams(await request.text());
    if (sameText(form.get('pin') || '', PIN)) {
      return redirectHome(`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1200)); // ชะลอการสุ่มรหัส
    return htmlResponse(loginPage(true), 401);
  }

  if (pathname === '/__lock') {
    return redirectHome(`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  }

  if (sameText(readCookie(request, COOKIE), token)) return next();
  return htmlResponse(loginPage(false), 401);
}
