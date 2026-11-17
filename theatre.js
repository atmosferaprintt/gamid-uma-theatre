/* Вариант 01 · Театр.
   Занавес рисуется в WebGL2: ткань собирается к подхватам (итальянская драпировка),
   складки сгущаются и темнеют, нижний край запаздывает и покачивается на пружине.
   Без WebGL2 работает упрощённый CSS-занавес; при «уменьшении движения» сцена открывается сразу. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('is-theatre')) return;

  const A = 'assets/theatre/';
  const CLOTH = 'assets/theatre-closed.webp';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  document.body.dataset.variant = '1';
  document.title = 'Театр · Гамид и Ума · 26.11.2026';
  document.querySelector('#welcome')?.remove();

  document.querySelector('.top-nav')?.remove();   // приглашение показывается без навигации по вариантам

  const main = document.querySelector('#invitation-content');
  main.inert = false;            // до открытия недоступен только лист под сценой (body.inert ниже)

  /* ---------- разметка ---------- */
  const calendar = (() => {
    const cells = Array(6).fill('');
    for (let d = 1; d <= 30; d++) cells.push(d);
    while (cells.length % 7) cells.push('');
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(`<tr>${cells.slice(i, i + 7).map(d => d === 26
        ? '<td class="th-marked"><span><time datetime="2026-11-26" aria-label="26 ноября — день свадьбы">26</time></span><svg class="th-pencil" viewBox="0 0 100 90" aria-hidden="true"><path pathLength="100" d="M38 11C18 13 7 31 10 50C13 70 34 82 55 77C78 74 91 55 87 36C83 16 63 7 45 10C32 12 21 20 17 28"/></svg></td>'
        : `<td>${d}</td>`).join('')}</tr>`);
    }
    return `<table aria-label="Ноябрь 2026, свадьба 26 ноября"><thead><tr>${['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].map(d => `<th scope="col">${d}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  })();

  const sealWax = `<img class="th-wax" src="${A}seal.webp" alt="">`;

  main.innerHTML = `
  <section class="th-stage" id="stage" aria-label="Гамид и Ума, 26 ноября 2026">
    <div class="th-backdrop" aria-hidden="true"></div>
    <div class="th-hero">
      <p class="th-eyebrow">Приглашение на свадьбу</p>
      <h1 class="th-names" id="main-title" tabindex="-1"><span class="sr-only">Гамид и Ума</span><span class="th-ink th-ink--top" aria-hidden="true"><img src="${A}names.webp" alt="" width="746" height="693"></span><span class="th-ink th-ink--bottom" aria-hidden="true"><img src="${A}names.webp" alt="" width="746" height="693"></span></h1>
      <p class="th-date"><span>26.11.2026</span></p>
    </div>
    <div class="th-veil" aria-hidden="true"><div class="th-panel th-panel--l"></div><div class="th-panel th-panel--r"></div></div>
    <canvas class="th-canvas" aria-hidden="true"></canvas>
    <div class="th-gate">
      <p class="th-gate-date">26 · 11 · 2026</p>
      <button class="th-seal" type="button"><span class="th-seal-img" aria-hidden="true">${sealWax}<span class="th-glint"></span></span><span class="th-seal-cap">Открыть приглашение</span></button>
    </div>
  </section>

  <div class="th-body" id="th-body">
    <section class="th-sec th-greet" data-reveal>
      <h2>Дорогие родные<br>и близкие!</h2>
      <p>Приглашаем вас разделить с нами радость нашего свадебного дня.</p>
    </section>

    <section class="th-sec th-cal" id="celebration-date">
      <div class="th-card" data-reveal>
        <p class="th-label">Дата торжества</p>
        <h2>Ноябрь 2026</h2>
        ${calendar}
        <button class="th-link th-save" type="button">Сохранить дату <span aria-hidden="true">↗</span></button>
      </div>
    </section>

    <section class="th-sec th-venue" data-reveal>
      <h2 class="th-label">Как добраться</h2>
      <p class="th-place"><img src="${A}place.webp" alt="Рамина Холл" width="1241" height="204"></p>
      <p class="th-address">г. Махачкала,<br>ул. Хаджи-Булача, 10</p>
      <p class="th-time"><time datetime="2026-11-26T16:00:00+03:00">26 ноября 2026 · 16:00</time></p>
      <a class="th-link" href="https://yandex.ru/maps/?rtext=~42.955350%2C47.546476" target="_blank" rel="noopener noreferrer">Посмотреть на карте <span aria-hidden="true">↗</span></a>
      <img class="th-venue-art" src="${A}ramina.webp" alt="Архитектурная иллюстрация здания Рамина Холл" width="1086" height="815" loading="lazy">
    </section>

    <section class="th-sec th-guests">
      <div class="th-note" data-reveal>
        <h2>Дорогие гости</h2>
        <p>Этот вечер мы планируем провести в кругу взрослых. Просим вас прийти без детей. Спасибо за понимание.</p>
      </div>
    </section>

    <section class="th-sec th-rsvp" id="rsvp">
      <div class="th-sheet" data-reveal>
        <h2>Будете ли вы с&nbsp;нами?</h2>
        <form id="rsvp-form" novalidate>
          <label class="th-field"><input id="guest-name" type="text" name="name" autocomplete="name" required minlength="2" maxlength="100" placeholder=" "><span>Ваше имя и фамилия</span></label>
          <fieldset><legend class="sr-only">Подтверждение присутствия</legend>
            <label class="th-choice"><input type="radio" name="attendance" value="yes" required><span>С радостью приду</span></label>
            <label class="th-choice"><input type="radio" name="attendance" value="no" required><span>К сожалению, не смогу</span></label>
          </fieldset>
          <button class="th-submit" type="submit">Отправить ответ</button>
          <p class="th-status" role="status" aria-live="polite"></p>
        </form>
      </div>
      <footer class="th-sign" data-reveal><p><img src="${A}sign.webp" alt="С любовью, семья Рамазановых" width="1735" height="536"></p><button class="th-replay" type="button">Повторить открытие</button></footer>
    </section>
  </div>`;

  const stage = main.querySelector('#stage');
  const body = main.querySelector('#th-body');
  const canvas = stage.querySelector('.th-canvas');
  const sealBtn = stage.querySelector('.th-seal');
  const title = stage.querySelector('#main-title');

  /* ---------- геометрия драпировки (в CSS-пикселях сцены) ---------- */
  function shapeFor(w, h) {
    const t = Math.min(1, Math.max(0, (w / h - 0.55) / (1.6 - 0.55)));
    const L = (a, b) => a + (b - a) * t;
    return { w, h, xt: w * L(0.12, 0.09), a0: w * L(0.46, 0.44), b: w * L(0.27, 0.18), yt: h * L(0.76, 0.7), k: L(2.5, 1.9), ov: Math.max(4, w * 0.01) };
  }

  /* ---------- WebGL-занавес ---------- */
  const VERT = `#version 300 es
  in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

  const FRAG = `#version 300 es
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes;      // размер сцены, css px
  uniform float uDpr;
  uniform vec4 uShape;    // xt, a0, b, yt
  uniform vec2 uShape2;   // k, overlap
  uniform float uMode;    // 0 закрыт, 1 открывается, 2 открыт, 3 закрывается
  uniform float uT;       // секунды с начала режима
  uniform float uClock;   // общее время для дыхания ткани
  uniform float uIdle;    // 1 = ткань «дышит»
  out vec4 outColor;

  const float PI = 3.14159265;

  float spring(float t, float z, float w){
    if (t <= 0.0) return 0.0;
    float wd = w * sqrt(1.0 - z*z);
    return 1.0 - exp(-z*w*t) * (cos(wd*t) + z*w/wd * sin(wd*t));
  }
  float springV(float t, float z, float w){
    if (t <= 0.0) return 0.0;
    float wd = w * sqrt(1.0 - z*z);
    return exp(-z*w*t) * (w*w/wd) * sin(wd*t);
  }

  float finalEdge(float y){
    float xt = uShape.x, a0 = uShape.y, b = uShape.z, yt = uShape.w;
    if (y < yt) return xt + (a0 - xt) * pow(1.0 - y/yt, uShape2.x);
    return xt + (b - xt) * pow((y - yt) / max(uRes.y - yt, 1.0), 1.7);
  }

  // мягкий модуль: ряды у подхвата ведут, но без острого излома
  float softAbs(float v, float e){ return sqrt(v*v + e*e) - e; }

  // 0 = занавес закрыт, 1 = подхвачен. vel = нормированная скорость для ряби.
  float progress(float y, float side, out float vel){
    float d = softAbs((y - uShape.w) / uRes.y, 0.06);
    vel = 0.0;
    if (uMode < 0.5) return 0.0;
    if (uMode < 1.5) {
      float delay = 0.30 + 0.38 * d * (y > uShape.w ? 1.45 : 1.0) + side * 0.07;
      float t = uT - delay;
      float tug = -0.03 * sin(PI * clamp(uT / 0.30, 0.0, 1.0));
      vel = springV(t, 0.62, 2.45) / 1.45;
      return spring(t, 0.62, 2.45) + tug;
    }
    if (uMode < 2.5) return 1.0;
    float delayC = 0.04 + 0.30 * (0.65 - min(d, 0.65)) + side * 0.05;
    float tc = uT - delayC;
    vel = -springV(tc, 0.86, 3.4) / 1.9;
    return 1.0 - spring(tc, 0.86, 3.4);
  }

  float edgeAt(float y, float side, out float P){
    float w = uRes.x, H = uRes.y;
    float vel;
    P = progress(y, side, vel);
    float Ec = w * 0.5 + uShape2.y;
    float d = softAbs((y - uShape.w) / H, 0.06);
    float E = mix(Ec, finalEdge(y), P);
    // волна по ткани во время движения: сильнее вдали от подхвата
    E += 0.022 * w * sin(y / H * 8.5 - uT * 5.2 + side * 1.3) * vel * min(d * 2.4, 1.0);
    // дыхание: открытый занавес чуть покачивается, закрытый едва колышется по низу
    float sway = sin(uClock * 0.85 + y / H * 2.6 + side * 1.9) * min(d * 2.5, 1.0) * 0.0045 * w;
    float calm = sin(uClock * 0.7 + y / H * 2.0 + side * 2.4) * (y / H) * (y / H) * 0.0035 * w;
    E += uIdle * (sway * clamp(P, 0.0, 1.0) + calm * (1.0 - clamp(P, 0.0, 1.0)));
    return max(E, 1.0);
  }

  float wrapDist(float f){
    if (f < 0.45) return f;
    float m = mod(f - 0.45, 0.8);
    return m < 0.4 ? 0.45 - m : 0.05 + (m - 0.4);
  }

  float stageLight(float px, float y){
    vec2 q = vec2((px / uRes.x - 0.5) / 0.6, (y / uRes.y - 0.4) / 0.78);
    return (0.76 + 0.28 * exp(-dot(q, q))) * (1.0 - 0.16 * smoothstep(0.7, 1.0, y / uRes.y));
  }

  vec3 cloth(float s, float y, float comp, float side, float dEdge, float px){
    float H = uRes.y;
    float f = s * 1.5 / H + 0.014;          // ширина текстуры = 2/3 высоты сцены; шов текстуры не берём
    float dist = wrapDist(f);
    vec2 uv = vec2(side < 0.5 ? 0.5 - dist : 0.5 + dist, clamp(y / H, 0.0, 1.0));
    vec2 gx = vec2(dFdx(f), dFdx(y / H));
    vec2 gy = vec2(dFdy(f), dFdy(y / H));
    vec3 c = textureGrad(uTex, uv, gx, gy).rgb;
    vec3 m = textureLod(uTex, uv, 6.0).rgb;
    float g = clamp(comp - 1.0, 0.0, 7.0);
    float gather = clamp(g / 2.6, 0.0, 1.0);
    c = m + (c - m) * (1.18 + 0.16 * g);    // собранная ткань = глубже складки
    // дополнительные складки сборки: густеют вместе со сжатием и веером расходятся от подхвата
    float P = 0.072 * H;
    float ph = 6.2831 * s / P + 0.7 * sin(y / H * 3.1 + s / P * 0.6 + side * 2.0);
    float fold = sin(ph);
    float crease = pow(0.5 + 0.5 * cos(ph), 5.0);
    c *= 1.0 + gather * (0.13 * fold - 0.20 * crease);
    c *= 1.0 - 0.035 * min(g, 6.0);         // и больше собственной тени
    c *= 0.9 + 0.1 * smoothstep(0.0, 22.0, dEdge);         // мягкий завал кромки
    c += 0.022 * exp(-pow((dEdge - 6.0) / 3.5, 2.0));       // блик на ребре
    c *= stageLight(px, y);
    return clamp(c, 0.0, 1.0);
  }

  // подхват: полоса той же ткани с тонким коралловым кантом, огибает собранное полотнище
  float tieCenter(float xs, float E){
    float s = clamp(xs / max(E, 1.0), 0.0, 1.0);
    return uShape.w + 0.006 * uRes.y * sin(3.14159 * s);
  }
  float tieHalf(){ return clamp(0.0105 * uRes.y, 6.5, 11.0); }
  vec4 tieBand(float xs, float E, float P, float y, float px){
    float amt = smoothstep(0.55, 0.92, P);
    float hb = tieHalf();
    float yc = tieCenter(xs, E);
    float v = (y - yc) / hb;
    float cov = clamp((1.0 - abs(v)) * hb + 0.5, 0.0, 1.0) * clamp(E + 1.5 - xs + 0.5, 0.0, 1.0) * amt;
    float s = clamp(xs / max(E, 1.0), 0.0, 1.0);
    vec3 base = textureLod(uTex, vec2(0.22 + 0.2 * s, 0.5 + 0.02 * v), 1.5).rgb;
    float wrap = 0.7 + 0.36 * sin(3.14159 * s);              // лента уходит за полотнище по краям
    float round_ = 1.0 - 0.14 * v - 0.28 * pow(abs(v), 6.0); // выпуклость ленты, свет сверху
    vec3 c = base * 0.96 * wrap * round_;
    float pipe = smoothstep(0.66, 0.76, abs(v)) * (1.0 - smoothstep(0.9, 1.0, abs(v)));
    vec3 coral = vec3(0.85, 0.40, 0.31) * (0.78 + 0.32 * wrap - 0.12 * v);
    c = mix(c, coral, pipe * 0.92);
    c *= stageLight(px, y);
    return vec4(clamp(c, 0.0, 1.0), 1.0) * cov;
  }
  float tieShadow(float xs, float E, float P, float y){
    float amt = smoothstep(0.55, 0.92, P);
    float dist = abs(y - tieCenter(xs, E)) - tieHalf();
    return 1.0 - amt * 0.34 * exp(-max(dist, 0.0) / 5.0) * step(0.0, dist);
  }

  // ламбрекен: фестоны поверх обоих полотнищ
  float valanceEdge(float x){
    float n = max(3.0, floor(uRes.x / 175.0 + 0.5));
    float pw = uRes.x / n;
    float vh = clamp(0.085 * uRes.y, 54.0, 92.0);
    return vh * (0.68 + 0.32 * sin(3.14159 * fract(x / pw)));
  }
  vec3 valance(float x, float y, float V){
    float n = max(3.0, floor(uRes.x / 175.0 + 0.5));
    float pw = uRes.x / n;
    float a = clamp(y / V, 0.0, 1.0);
    float fx = fract(x / pw);
    vec2 uv = vec2(0.14 + 0.26 * a, clamp(x / (1.6 * uRes.y), 0.0, 1.0));
    vec3 c = texture(uTex, uv).rgb;
    float sw = sin(a * 6.2831 * 1.5 + 0.9);                 // горизонтальные складки фестона
    c *= 0.94 + 0.09 * sw;
    float jab = exp(-pow(min(fx, 1.0 - fx) / 0.07, 2.0));   // сборка в местах подвеса
    c *= 1.0 - 0.22 * jab * (1.0 - a * 0.6);
    c *= 0.86 + 0.14 * smoothstep(0.0, 0.35, a);            // у карниза темнее
    c += 0.05 * exp(-pow((V - y - 3.0) / 2.2, 2.0));        // подсвеченная кромка
    c *= stageLight(x, y) * 0.95;
    return clamp(c, 0.0, 1.0);
  }

  void main(){
    float x = gl_FragCoord.x / uDpr;
    float y = uRes.y - gl_FragCoord.y / uDpr;
    float w = uRes.x, H = uRes.y;
    float Ec = w * 0.5 + uShape2.y;
    float PL, PR;
    float EL = edgeAt(y, 0.0, PL);
    float ER = edgeAt(y, 1.0, PR);
    float xr = w - x;

    float dL = EL - x, dR = ER - xr;
    float sL = max(dL, 0.0) / EL * Ec;
    float sR = max(dR, 0.0) / ER * Ec;
    vec3 cL = cloth(sL, y, Ec / EL, 0.0, max(dL, 0.0), x);
    vec3 cR = cloth(sR, y, Ec / ER, 1.0, max(dR, 0.0), x);
    cR *= 1.0 - 0.34 * exp(-max(-dL, 0.0) / 11.0);          // левая полотнище отбрасывает тень на правое

    float covL = clamp(dL + 0.5, 0.0, 1.0);
    float covR = clamp(dR + 0.5, 0.0, 1.0);

    float V = valanceEdge(x);
    float soft = 0.045 * w + 8.0;
    float sh = 0.30 * exp(-max(-dL, 0.0) / soft) + 0.30 * exp(-max(-dR, 0.0) / soft);
    sh += 0.30 * exp(-max(y - V, 0.0) / (0.05 * H));        // тень от ламбрекена на заднике
    sh = clamp(sh, 0.0, 0.55);

    // ламбрекен отбрасывает тень и на сами полотнища
    float vShade = 1.0 - 0.38 * exp(-max(y - V, 0.0) / (0.03 * H));
    cL *= vShade * tieShadow(x, EL, PL, y);
    cR *= vShade * tieShadow(xr, ER, PR, y);

    vec4 col = vec4(0.0, 0.0, 0.0, sh);
    col = vec4(cR, 1.0) * covR + col * (1.0 - covR);
    col = vec4(cL, 1.0) * covL + col * (1.0 - covL);
    vec4 bR = tieBand(xr, ER, PR, y, x);
    col = bR + col * (1.0 - bR.a);
    vec4 bL = tieBand(x, EL, PL, y, x);
    col = bL + col * (1.0 - bL.a);
    float covV = clamp(V - y + 0.5, 0.0, 1.0);
    col = vec4(valance(x, y, V), 1.0) * covV + col * (1.0 - covV);
    outColor = col;
  }`;

  function createCurtain(cnv) {
    let gl;
    try { gl = cnv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' }); } catch (_) { gl = null; }
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return null; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ['uTex', 'uRes', 'uDpr', 'uShape', 'uShape2', 'uMode', 'uT', 'uClock', 'uIdle'].forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
    const tex = gl.createTexture();
    let ready = false;
    return {
      setImage(img) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const an = gl.getExtension('EXT_texture_filter_anisotropic');
        if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
        gl.uniform1i(U.uTex, 0);
        ready = true;
      },
      draw(s, dpr, mode, t, clock, idle) {
        if (!ready) return;
        gl.viewport(0, 0, cnv.width, cnv.height);
        gl.uniform2f(U.uRes, s.w, s.h);
        gl.uniform1f(U.uDpr, dpr);
        gl.uniform4f(U.uShape, s.xt, s.a0, s.b, s.yt);
        gl.uniform2f(U.uShape2, s.k, s.ov);
        gl.uniform1f(U.uMode, mode);
        gl.uniform1f(U.uT, t);
        gl.uniform1f(U.uClock, clock);
        gl.uniform1f(U.uIdle, idle);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      lost: () => gl.isContextLost()
    };
  }

  /* ---------- состояние ---------- */
  const curtain = createCurtain(canvas);
  if (!curtain) stage.classList.add('is-fallback');
  let shape = shapeFor(innerWidth, innerHeight);
  let dpr = 1;
  let mode = 0;                 // 0 закрыт, 1 открывается, 2 открыт, 3 закрывается
  let modeStart = performance.now();
  const clock0 = performance.now();
  let visible = true, raf = 0, lastDraw = 0;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

  function layout() {
    const r = stage.getBoundingClientRect();
    shape = shapeFor(r.width, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    draw(performance.now(), true);
  }

  function draw(now, force) {
    if (!curtain) return;
    const t = (now - modeStart) / 1000;
    const busy = (mode === 1 && t < 5) || (mode === 3 && t < 2.6);
    if (!force && !busy && now - lastDraw < 32) return;      // в покое хватает ~30 кадров
    lastDraw = now;
    curtain.draw(shape, dpr, mode, t, (now - clock0) / 1000, reduced.matches ? 0 : 1);
  }

  function loop(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    draw(now, false);
    const t = (now - modeStart) / 1000;
    const busy = (mode === 1 && t < 5) || (mode === 3 && t < 2.6);
    if (busy || !reduced.matches) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function setMode(m) { mode = m; modeStart = performance.now(); kick(); }

  /* ---------- блокировка прокрутки до открытия ---------- */
  function lock() { root.classList.add('intro-locked'); body.inert = true; window.scrollTo(0, 0); }
  function unlock() { root.classList.remove('intro-locked'); body.inert = false; }
  try { history.scrollRestoration = 'manual'; } catch (_) {}

  /* ---------- сценарий ---------- */
  let state = 'closed';

  function open() {
    if (state !== 'closed') return;
    state = 'opening';
    sealBtn.disabled = true;
    stage.classList.add('is-opening');
    if (reduced.matches) { finish(); return; }
    setMode(1);
    later(() => stage.classList.add('is-revealed'), 1050);
    later(() => stage.classList.add('is-tied'), 1750);
    later(() => { unlock(); title.focus({ preventScroll: true }); }, 2100);
    later(() => { state = 'open'; stage.classList.add('is-settled'); }, 3300);
  }

  function finish() {
    clearTimers();
    state = 'open';
    stage.classList.add('is-opening', 'is-revealed', 'is-tied', 'is-settled', 'no-anim');
    setMode(2);
    unlock();
    title.focus({ preventScroll: true });
    requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('no-anim')));
  }

  function replay() {
    if (state === 'closing') return;
    clearTimers();
    state = 'closing';
    const run = () => {
      lock();
      stage.classList.remove('is-settled', 'is-tied');
      later(() => stage.classList.remove('is-revealed'), 120);
      if (reduced.matches) { closeDone(); return; }
      later(() => setMode(3), 260);
      later(closeDone, 2000);
    };
    if (window.scrollY > 2 && !reduced.matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const start = performance.now();
      const wait = () => { if (window.scrollY <= 2 || performance.now() - start > 1400) run(); else requestAnimationFrame(wait); };
      requestAnimationFrame(wait);
    } else run();
  }

  function closeDone() {
    setMode(0);
    stage.classList.remove('is-opening', 'is-revealed', 'is-tied', 'is-settled');
    state = 'closed';
    sealBtn.disabled = false;
    sealBtn.focus({ preventScroll: true });
  }

  sealBtn.addEventListener('click', open);
  main.querySelector('.th-replay').addEventListener('click', replay);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state === 'opening') { e.preventDefault(); finish(); }
  });
  window.addEventListener('scroll', () => { if (state === 'closed' && window.scrollY) window.scrollTo(0, 0); }, { passive: true });
  window.addEventListener('pageshow', e => { if (e.persisted && state !== 'closed') finish(); });

  /* ---------- загрузка ткани ---------- */
  lock();
  stage.classList.add('is-loading');
  const reveal = () => { stage.classList.remove('is-loading'); stage.classList.add('is-ready'); };
  if (curtain) {
    const img = new Image();
    img.decoding = 'async';
    img.src = CLOTH;
    img.decode().then(() => {
      curtain.setImage(img);
      canvas.classList.add('is-ready');
      layout();
      reveal();
      kick();
    }).catch(() => { stage.classList.add('is-fallback'); reveal(); });
  } else {
    reveal();
  }
  // Ткань не загрузилась за 6 секунд: показываем простой занавес, кнопка остаётся рабочей.
  setTimeout(() => { if (stage.classList.contains('is-loading')) { stage.classList.add('is-fallback'); reveal(); } }, 6000);

  if ('ResizeObserver' in window) new ResizeObserver(() => layout()).observe(stage);
  else window.addEventListener('resize', layout);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stage.classList.add('is-fallback'); });

  /* ---------- появление блоков при прокрутке ---------- */
  const revealables = [...body.querySelectorAll('[data-reveal]')];
  revealables.forEach(el => [...el.children].forEach((c, i) => c.style.setProperty('--i', i)));
  if (reduced.matches || !('IntersectionObserver' in window)) revealables.forEach(el => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(el => io.observe(el));
  }

  /* ---------- форма и календарь (логика прежняя) ---------- */
  const form = main.querySelector('#rsvp-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name;
    name.setCustomValidity(name.value.trim().length < 2 ? 'Пожалуйста, укажите имя и фамилию.' : '');
    if (!form.reportValidity()) return;
    form.querySelector('.th-status').textContent = 'Отправка в WhatsApp пока не подключена. Ваш ответ не отправлен.';
  });
  main.querySelector('#guest-name').addEventListener('input', e => e.target.setCustomValidity(''));
  main.querySelector('.th-save').addEventListener('click', () => {
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Gamid Uma//Wedding//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:gamid-uma-20261126@invitation.local','DTSTAMP:20261117T000000Z','DTSTART:20261126T130000Z','SUMMARY:Свадьба Гамида и Умы','LOCATION:Рамина Холл\\, г. Махачкала\\, ул. Хаджи-Булача\\, 10','DESCRIPTION:Приглашаем вас разделить с нами радость нашего свадебного дня.','END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'gamid-uma-26-11-2026.ics'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // для проверки и отладки: window.__theatre.finish() / .replay()
  window.__theatre = { open, finish, replay, get state() { return state; } };
})();
