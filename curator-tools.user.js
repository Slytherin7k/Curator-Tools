// ==UserScript==
// @name         Eduson Curator — Пинги и Теги
// @namespace    eduson-curator-tools
// @version      0.1.0
// @description  Кнопка в шапке обращения OmniDesk: готовые пинги в Телеграм (с подстановкой тега, ссылки и данных студента) и поиск по справочнику тегов Эдюсон
// @author       Astanina Natalia
// @homepageURL  https://github.com/Slytherin7k/Curator-Tools
// @updateURL    https://raw.githubusercontent.com/Slytherin7k/Curator-Tools/main/curator-tools.user.js
// @downloadURL  https://raw.githubusercontent.com/Slytherin7k/Curator-Tools/main/curator-tools.user.js
// @match        https://*.omnidesk.ru/*
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const VER = '0.1.0';
  const TAG = '[curator-tools]';
  const ACC = '#0284C7';
  const ACC_DEEP = '#075985';
  const ACC_BD = '#BAE6FD';
  const FONT = 'Nunito, system-ui, -apple-system, "Segoe UI", sans-serif';

  /* ==================== СПРАВОЧНИК ==================== */
  // Кластеры: продакт + лид контента + ключевые слова курса для автоопределения.
  const CLUSTERS = {
    'Менеджмент': {
      product: { name: 'Александр Зырянов', tag: '@alexanderzyryanov' },
      lead: { name: 'Наталья Сухаг', tag: '@nataliya_suhag' },
      kw: ['коммерческ', 'генеральн', 'исполнительн', 'ceo', 'роп', 'управление командами', 'директор по продаж',
           'менеджер отдела продаж', 'soft skills', 'софт скилл', 'управление продажами', 'тайм-менеджмент',
           'бизнес-консультант', 'директор по закупкам', 'клиентск', 'категорийн', 'антикризис',
           'управление малым бизнесом', 'госзакупок', 'управление закупками', 'для отдела продаж',
           'управление медицинской']
    },
    'Финансы': {
      product: { name: 'Зоя Гавриленко', tag: '@zoya_vlady' },
      lead: { name: 'Денис Соболев', tag: '@densoboldr' },
      kw: ['финансов', 'управление финансами', 'операционный директор', 'экономик', 'управление предприятием',
           'операционное управление', 'финансовое моделир', 'стратегическому развитию', 'нефинансист',
           'по строительству', 'по производству', 'инвестицион', 'emba']
    },
    'Бухгалтерия': {
      product: { name: 'Джу', tag: '@hey_juliko' },
      lead: { name: 'Алан Гадзаонов', tag: '@alangadzaonov' },
      kw: ['бухгалтер', '1с', 'бухучёт', 'бухучет', 'excel', 'ms office', 'мастер презентаций',
           'право для бизнеса', 'внутренний аудитор', 'аудит']
    },
    'Маркетинг и дизайн': {
      product: { name: 'Александр Шамша', tag: '@Ashamsha' },
      lead: { name: 'Анастасия Злобина', tag: '@zlobina_nastya' },
      kw: ['маркетолог', 'маркетинг', 'smm', 'смм', 'копирайтер', 'веб-дизайн', 'графическ', 'дизайнер',
           'трафик', 'интерьер', '3ds max', '3д макс', 'revit', 'autodesk']
    },
    'IT и Аналитика': {
      product: { name: 'Дмитрий Пронин', tag: '@Dmitriy_PR0' },
      lead: { name: 'Екатерина Гудовская', tag: '@egudovskaia' },
      kw: ['аналитик', 'data science', 'дата сайнс', 'power bi', 'sql', 'bi', 'python', 'питон', 'frontend',
           'фронтенд', 'веб-разработчик', 'тестировщик', 'тестирован', 'it-директор', 'it-специалист',
           'разработчик']
    },
    'МПП (маркетплейсы, проекты, продакт)': {
      product: { name: 'Михаил Свирин', tag: '@mikhail_svirin' },
      lead: { name: 'Анна Серебрякова', tag: '@serebryaka' },
      kw: ['менеджер проектов', 'маркетплейс', 'продакт', 'управление проектами', 'project manager',
           'проджект', 'по логистике', 'цифровое предприним', 'cpo', 'проектного офиса',
           'управление логистикой', 'цепями поставок', 'инженер пто', 'autocad', 'в строительстве']
    },
    'HR и психология': {
      product: { name: 'Анна Фирсова', tag: '@yatriks' },
      lead: { name: 'Алиса Арцыман', tag: '@alicearts' },
      kw: ['психолог', 'hr', 'эйчар', 'управлению персоналом', 'методист', 'образовательных программ',
           'продюсер онлайн', 'онлайн-репетитор', 'развитие персонала', 'кадровое делопроизводство',
           'бизнес-ассистент', 't&d', 'mini-mba']
    },
    'Отраслевое управление': {
      product: { name: 'Алиса Затона', tag: '@alisa_zatona' },
      lead: null,
      kw: ['отраслев']
    },
    'Ресейл': {
      product: { name: 'Дмитрий Пронин', tag: '@Dmitriy_PR0' },
      lead: null,
      note: 'ресерчер — Николай Екимов @n_ekimov',
      kw: ['ресейл', 'resale']
    },
    'Детские курсы': {
      product: { name: 'Даниил Терентев', tag: '@dd_terentev' },
      lead: null,
      kw: ['детск', 'для детей', 'школьник', 'подростк']
    }
  };

  // Команды продаж: руководитель → тег + список МОП
  const TEAMS = {
    'Людмила Отрокуша': { tag: '@Mila_Otrokusha', dept: 'департамент Кобзева',
      mops: ['Косарев Юрий', 'Перова Юлия', 'Лобков Артур', 'Бондаренко Андрей', 'Мартышкина Ольга', 'Пасхалиди Димитрий', 'Зинченко Алена'] },
    'Александр Куликов': { tag: '@alexandrkulikof', dept: 'департамент Кобзева',
      mops: ['Ильина Диана', 'Кухто Арина', 'Беспалов Евгений', 'Забродская Карина', 'Пухова Полина', 'Пруненко Татьяна'] },
    'Александр Кондратьев': { tag: '@kondratev_av', dept: 'РОП Финансы и Бухгалтерия · департамент Кобзева',
      mops: ['Данилов Алексей', 'Руденко Оксана', 'Рассомакин Иван', 'Шапошникова Натали', 'Шевелева Ксения'] },
    'Марина Чехова': { tag: '@marinachekhova', dept: 'департамент Кобзева',
      mops: ['Жолобова Анастасия', 'Крестьянникова Александра', 'Гурулёва Дарья', 'Шарапова Анастасия', 'Соколова Анастасия', 'Иваненко Андрей'] },
    'Александр Фоменко': { tag: '@av_fomenko', dept: 'РОП Менеджмент, МПП и HR · департамент Шарипова',
      mops: ['Дубровина Ольга', 'Попова Анастасия', 'Красовский Антон', 'Гетманов Николай', 'Мишин Иван', 'Костюк Матвей', 'Иванов Алексей', 'Байраковский Кирилл'] },
    'Виталий Львовский': { tag: '@lvovskiy_vit', dept: 'департамент Шарипова',
      mops: ['Кузнецова Екатерина', 'Шмаков Юрий', 'Зыбченко Анастасия', 'Сопилкина Наталья', 'Соловьева Светлана', 'Пилипенко Ольга', 'Уварова Ольга', 'Скакун Артур'] },
    'Анар Шабанов': { tag: '@az_anar', dept: 'департамент Шарипова',
      mops: ['Константинова Екатерина', 'Тагиль Карина', 'Кузнецов Артур', 'Левченко Владислав', 'Пименова Виктория', 'Тихомирова Алина', 'Сычева Татьяна'] },
    'Владислав Кожанов': { tag: '@kozhanov_eduson', dept: 'департамент Шарипова',
      mops: ['Печинога Валерия', 'Шеханова Лилия', 'Негреева Диана', 'Агаджанян Валерия', 'Рагимов Максун', 'Тихомирова Мария'] },
    'Денис Клементович': { tag: '@Klem_Den_lucky', dept: 'РОП IT и Аналитика',
      mops: ['Соколовский Александр', 'Виноградов Виктор', 'Рябова Эльвира', 'Шум Карина', 'Качегова Даяна', 'Яловегин Николай', 'Ильницкий Илларион', 'Гончарова Ирина', 'Денежкин Никита', 'Журавлева Евгения', 'Зинкевич Елизавета'] },
    'Владимир Толстов': { tag: '@Vladimir_Tolstov_m', dept: 'РОП Маркетинг',
      mops: ['Прохорова Василиса', 'Романова Людмила', 'Гусев Кирилл', 'Квон Екатерина', 'Сартакова Евгения', 'Умнова Виктория', 'Трифонова Ольга', 'Максимов Владислав', 'Папко Екатерина'] },
    'Давид Багатурия': { tag: '@D_Bagaturia', dept: '',
      mops: ['Белеева Мария', 'Фролова Екатерина', 'Лем Станислав', 'Степанов Петр', 'Михайлова Карина', 'Брудковски Александра', 'Гагилев Дмитрий', 'Вендин Максим', 'Золотарев Игорь'] }
  };

  const DZ_DEFAULT = { name: 'Мария Старцева', tag: '@maria_startceva' };
  const DZ_REVIEWERS = [
    { name: 'Даниил Тюрин', tag: '@TurinDE' },
    { name: 'Вадим Романенко', tag: '@vadim_romanenk0' },
    { name: 'Анна Серебрякова', tag: '@serebryaka' },
    { name: 'Яков Дмитриев', tag: '@Dmitriev_Yakov' },
    { name: 'Нина Пилипенко', tag: '@Chosi88' }
  ];

  const ESCALATIONS = [
    { name: 'Юля Проняева', tag: '@yilya_pronyaeva', note: 'справки об оплате, дипломы, негатив из чатов, претензии, сложные и негативные кейсы, непонятки по тикетам · можно в чат онбординга' },
    { name: 'Маша Киликян', tag: '@Sh_enma', note: 'закрывающие документы — передаём её почту, шаблон «Нужны закрывающие документы»; не отвечают → чат «Закрывашки»' },
    { name: 'Антон Трепко', tag: '@anteneshe', note: 'отправка диплома, проверка в ФИС ФРДО · замещение Маши Киликян по закрывающим' },
    { name: 'Катя Дедловская', tag: '@ededlovskaya', note: 'стажировка в IT и дизайне — в чате нужного кластера; поиск экспертов — доска в Notion + чат обсуждения консультаций' },
    { name: 'Лена Чубарь', tag: '@El_Chubb', note: 'ЭДО по закрывающим · B2B' },
    { name: 'Ленара Галялиева', tag: '@Lenara_Galyalieva', note: 'B2B' },
    { name: 'Александр Кобзев', tag: '@A_Kobzev', note: 'директор департамента Финансы и Бухгалтерия' },
    { name: 'Вагиз Шарипов', tag: '@vagiz_sh', note: 'директор департамента Менеджмент, МПП и HR' },
    { name: 'Алексей Семериков', tag: '@Semerikov_Aleksey', note: 'директор департамента Маркетинг, IT и Аналитика' }
  ];

  // Пинги. {тег} {ссылка} {ссылка_амо} {цитата} {имя} {email} {телефон} — подставляются.
  const PINGS = [
    { id: 'question', title: 'Завис вопрос', tagHint: 'product',
      text: 'Привет, {тег}! Подвис вопрос от студента — посмотри, пожалуйста.\nОбращение: {ссылка}' },
    { id: 'dz', title: 'Зависла проверка ДЗ', tagHint: 'dz',
      text: 'Привет, {тег}! Подвисла проверка ДЗ — посмотри, пожалуйста.\nОбращение: {ссылка}' },
    { id: 'sending', title: 'Задержка отправки', tagHint: 'team',
      text: 'Привет, {тег}! Подвисла отправка, задержка уже большая — возьми, пожалуйста, в ближайшую очередь.\nОбращение: {ссылка}' },
    { id: 'payment', title: 'Вопрос по оплате / подарочному', tagHint: 'team',
      text: 'Привет, {тег}! Студент написал в амо по оплате / подарочному сертификату — свяжись с ним, пожалуйста.\nСделка в амо: {ссылка_амо}' },
    { id: 'lead', title: 'Новый лид', tagHint: 'none',
      text: '✳️ НОВЫЙ ЛИД ✳️\nВозьмите в работу, пожалуйста.\n\nСообщение клиента:\n«{цитата}»\n\n{имя} · {email} · {телефон}\nСделка в амо: {ссылка_амо}' }
  ];

  /* ==================== ЧТЕНИЕ КОНТЕКСТА ==================== */
  function caseUrl() { return location.href.split('?')[0].split('#')[0]; }

  function sidebarValue(labelRe) {
    const labs = document.querySelectorAll('.right_info_panels *, #info_panel_wrap *, .info_panel_nano *');
    for (const el of labs) {
      const t = (el.textContent || '').trim();
      if (t.length > 40 || !labelRe.test(t)) continue;
      // значение — в следующем элементе или в родителе после лейбла
      let v = el.nextElementSibling && el.nextElementSibling.textContent;
      if (!v && el.parentElement) v = el.parentElement.textContent.replace(t, '');
      v = (v || '').replace(/\s+/g, ' ').trim();
      if (v && v !== '—' && v !== '-') return v;
    }
    return '';
  }

  function readCourse() { return sidebarValue(/^курс$/i); }

  function readUser() {
    return {
      name: sidebarValue(/^(полное имя|имя)$/i),
      email: sidebarValue(/^(email|e-mail|email-адрес|почта)$/i),
      phone: sidebarValue(/^(телефон|phone)$/i)
    };
  }

  function clientMsgs() {
    // сообщения клиента в переписке OmniDesk: li[id^="message_"] .js_only_text_orig,
    // клиентские — обычно без класса менеджера/бота
    const items = document.querySelectorAll('li[id^="message_"]');
    const res = [];
    items.forEach(function (li) {
      const c = (li.className || '') + ' ' + ((li.querySelector('.chat_msg_wrap') || {}).className || '');
      if (/manager|staff|bot|system|note|_ai|robot/i.test(c)) return;
      const t = li.querySelector('.js_only_text_orig') || li.querySelector('.js_only_text');
      const txt = (t ? t.textContent : '').replace(/\s+/g, ' ').trim();
      if (txt && !/^https?:\/\/\S+$/.test(txt)) res.push(txt);
    });
    return res;
  }
  function lastClientMsg() { const m = clientMsgs(); return m[m.length - 1] || ''; }
  function firstClientMsg() { const m = clientMsgs(); return m[0] || ''; }

  function amoLink() {
    const a = Array.from(document.querySelectorAll('a[href*="amocrm.ru"], a[href*="/leads/detail/"]'))
      .find(function (x) { return /amocrm\.ru|leads\/detail/.test(x.href); });
    return a ? a.href : '';
  }

  function detectCluster(course) {
    const c = (course || readCourse() || '').toLowerCase().replace(/ё/g, 'е');
    if (!c) return null;
    let best = null, bestLen = 0;
    for (const name in CLUSTERS) {
      for (const k of CLUSTERS[name].kw) {
        if (c.indexOf(k) !== -1 && k.length > bestLen) { best = name; bestLen = k.length; }
      }
    }
    return best;
  }

  /* ==================== ПОДСТАНОВКА В ПИНГ ==================== */
  function buildPing(ping) {
    const course = readCourse();
    const cluster = detectCluster(course);
    let tag = '{тег}';
    if (ping.tagHint === 'product' && cluster) tag = CLUSTERS[cluster].product.tag;
    else if (ping.tagHint === 'dz') tag = DZ_DEFAULT.tag;

    const u = readUser();
    const quote = ping.id === 'lead' ? (firstClientMsg() || lastClientMsg()) : lastClientMsg();
    const out = ping.text
      .replace('{тег}', tag)
      .replace('{ссылка}', caseUrl())
      .replace('{ссылка_амо}', amoLink() || '{ссылка на сделку в амо}')
      .replace('{цитата}', quote || '{цитата из сообщения}')
      .replace('{имя}', u.name || '{имя}')
      .replace('{email}', u.email || '{email}')
      .replace('{телефон}', u.phone || '{телефон}');
    return { text: out, cluster: cluster, needTag: out.indexOf('{тег}') !== -1 };
  }

  /* ==================== UI ==================== */
  function copyText(t) {
    try { GM_setClipboard(t); } catch (e) {
      try { navigator.clipboard.writeText(t); } catch (e2) {}
    }
  }

  let toastTimer = null;
  function toast(msg, ms) {
    let box = document.getElementById('curator-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'curator-toast';
      box.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:2147483647;max-width:320px;background:#fff;color:#1F2937;padding:10px 14px;border:1px solid #E5E7EB;border-left:5px solid ' + ACC + ';border-radius:12px;font:600 12px/1.5 ' + FONT + ';white-space:pre-wrap;box-shadow:0 12px 36px rgba(15,23,42,.22);';
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.style.display = 'none'; }, ms || 2600);
  }

  function elt(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }

  const PANEL_ID = 'curator-panel';
  function togglePanel() {
    let p = document.getElementById(PANEL_ID);
    if (p) { p.remove(); return; }
    p = buildPanel();
    document.body.appendChild(p);
  }

  function buildPanel() {
    const p = elt('div', 'position:fixed;z-index:2147483646;top:64px;right:18px;width:340px;max-height:78vh;overflow:auto;' +
      'background:#fff;color:#1F2937;border:1px solid #E5E7EB;border-radius:16px;box-shadow:0 18px 48px rgba(15,23,42,.24);' +
      'font-family:' + FONT + ';padding:12px 14px;');
    p.id = PANEL_ID;

    const head = elt('div', 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;');
    head.appendChild(elt('div', 'font-weight:800;font-size:12px;color:' + ACC + ';letter-spacing:.3px;', 'Пинги и теги'));
    const x = elt('span', 'cursor:pointer;color:#9CA3AF;font-size:15px;line-height:1;', '✕');
    x.onclick = togglePanel;
    head.appendChild(x);
    p.appendChild(head);

    // вкладки
    const tabs = elt('div', 'display:flex;gap:6px;margin-bottom:10px;');
    const body = elt('div', '');
    const mkTab = function (label, fn) {
      const b = elt('div', 'flex:1;text-align:center;cursor:pointer;font-weight:800;font-size:11px;padding:6px 0;border-radius:999px;border:1.5px solid ' + ACC_BD + ';color:' + ACC + ';', label);
      b.onclick = function () {
        Array.from(tabs.children).forEach(function (t) { t.style.background = '#fff'; t.style.color = ACC; });
        b.style.background = ACC; b.style.color = '#fff';
        body.innerHTML = '';
        fn(body);
      };
      return b;
    };
    const tPing = mkTab('Пинги', renderPings);
    const tTag = mkTab('Теги', renderTags);
    tabs.appendChild(tPing);
    tabs.appendChild(tTag);
    p.appendChild(tabs);
    p.appendChild(body);
    tPing.onclick();
    return p;
  }

  function renderPings(body) {
    const course = readCourse();
    const cluster = detectCluster(course);
    const ctx = elt('div', 'font-size:11px;color:#6B7280;font-weight:700;margin-bottom:8px;',
      cluster ? ('Кластер по курсу: ' + cluster) : (course ? 'Курс: ' + course + ' — кластер не распознан' : 'Курс в карточке не найден'));
    body.appendChild(ctx);

    PINGS.forEach(function (ping) {
      const row = elt('div', 'border:1px solid #E5E7EB;border-radius:12px;padding:8px 10px;margin-bottom:7px;cursor:pointer;');
      row.appendChild(elt('div', 'font-weight:800;font-size:12.5px;', ping.title));
      row.onclick = function () { showPingResult(body, ping); };
      row.onmouseenter = function () { row.style.borderColor = ACC_BD; row.style.background = '#F0F9FF'; };
      row.onmouseleave = function () { row.style.borderColor = '#E5E7EB'; row.style.background = '#fff'; };
      body.appendChild(row);
    });
  }

  function showPingResult(body, ping) {
    body.innerHTML = '';
    const back = elt('div', 'font-size:11px;font-weight:800;color:' + ACC + ';cursor:pointer;margin-bottom:8px;', '‹ назад к пингам');
    back.onclick = function () { body.innerHTML = ''; renderPings(body); };
    body.appendChild(back);

    const r = buildPing(ping);
    body.appendChild(elt('div', 'font-weight:800;font-size:12.5px;margin-bottom:6px;', ping.title));

    const ta = elt('textarea', 'width:100%;min-height:150px;border:1px solid #D1D5DB;border-radius:10px;padding:8px 10px;font:500 12px/1.5 ' + FONT + ';color:#111827;resize:vertical;');
    ta.value = r.text;
    body.appendChild(ta);

    if (r.needTag) {
      const hint = elt('div', 'font-size:11px;color:#B45309;font-weight:700;margin-top:6px;',
        ping.tagHint === 'team' ? 'Впиши тег руководителя команды МОП вместо {тег} (см. вкладку «Теги»).'
          : 'Впиши нужный тег вместо {тег}.');
      body.appendChild(hint);
    }

    const btns = elt('div', 'display:flex;gap:7px;margin-top:9px;');
    const copyB = elt('div', 'flex:1;text-align:center;background:' + ACC + ';color:#fff;font-weight:800;font-size:12px;padding:8px 0;border-radius:12px;cursor:pointer;', '📋 Копировать');
    copyB.onclick = function () { copyText(ta.value); toast('Скопировано — вставь в нужный чат Телеграм'); };
    btns.appendChild(copyB);
    body.appendChild(btns);
  }

  function buildTagIndex() {
    const idx = [];
    for (const name in CLUSTERS) {
      const c = CLUSTERS[name];
      const kw = (c.kw || []).join(' ');
      idx.push({ cat: 'Продакт', name: name + ' — ' + c.product.name, tag: c.product.tag, note: c.note || '', kw: kw });
      if (c.lead) idx.push({ cat: 'Лид контента', name: name + ' — ' + c.lead.name, tag: c.lead.tag, note: '', kw: kw });
    }
    for (const lead in TEAMS) {
      const t = TEAMS[lead];
      idx.push({ cat: 'Команда продаж', name: lead + ' (руководитель)', tag: t.tag, note: t.dept });
      t.mops.forEach(function (m) {
        idx.push({ cat: 'Команда продаж', name: m, tag: t.tag, note: 'команда: ' + lead });
      });
    }
    idx.push({ cat: 'Проверяющий ДЗ', name: DZ_DEFAULT.name + ' — по умолчанию', tag: DZ_DEFAULT.tag, note: '' });
    DZ_REVIEWERS.forEach(function (d) { idx.push({ cat: 'Проверяющий ДЗ', name: d.name, tag: d.tag, note: '' }); });
    ESCALATIONS.forEach(function (e) { idx.push({ cat: 'Эскалация', name: e.name, tag: e.tag, note: e.note }); });
    return idx;
  }
  const TAG_INDEX = buildTagIndex();

  function renderTags(body) {
    const q = elt('input', 'width:100%;padding:8px 11px;border:1px solid #D1D5DB;border-radius:10px;font:600 13px ' + FONT + ';color:#111827;margin-bottom:8px;');
    q.type = 'search';
    q.placeholder = 'Поиск: МОП, кластер, ситуация…';
    body.appendChild(q);

    const list = elt('div', '');
    body.appendChild(list);

    const draw = function () {
      const v = q.value.trim().toLowerCase().replace(/ё/g, 'е');
      list.innerHTML = '';
      let shown = 0, lastCat = '';
      TAG_INDEX.forEach(function (row) {
        if (v) {
          const hay = (row.cat + ' ' + row.name + ' ' + row.tag + ' ' + row.note + ' ' + (row.kw || '')).toLowerCase().replace(/ё/g, 'е');
          if (v.split(/\s+/).some(function (t) { return hay.indexOf(t) === -1; })) return;
        }
        if (shown > 60) return;
        if (row.cat !== lastCat) {
          list.appendChild(elt('div', 'font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#9CA3AF;margin:9px 0 3px;', row.cat));
          lastCat = row.cat;
        }
        const it = elt('div', 'display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:5px 6px;border-radius:8px;cursor:pointer;');
        it.appendChild(elt('div', 'font-size:12.5px;font-weight:700;color:#111827;flex:1;', row.name + (row.note ? '  ·  ' + row.note : '')));
        it.appendChild(elt('div', 'font:500 12px ' + 'IBM Plex Mono, ' + FONT + ';color:' + ACC_DEEP + ';white-space:nowrap;', row.tag));
        it.onmouseenter = function () { it.style.background = '#F0F9FF'; };
        it.onmouseleave = function () { it.style.background = 'transparent'; };
        it.onclick = function () { copyText(row.tag); toast('Скопирован тег ' + row.tag); };
        list.appendChild(it);
        shown++;
      });
      if (!shown) list.appendChild(elt('div', 'color:#9CA3AF;font-weight:700;font-size:12px;padding:14px 0;text-align:center;', 'Ничего не найдено'));
    };
    q.addEventListener('input', draw);
    draw();
  }

  /* ==================== КНОПКА В ШАПКЕ ==================== */
  const BTN_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  function ensureButton() {
    const bar = document.querySelector('.request-content-title-act');
    if (!bar) {
      const ex = document.getElementById('curator-hdr');
      if (ex) ex.remove();
      return;
    }
    let wrap = document.getElementById('curator-hdr');
    if (!wrap) {
      wrap = elt('div', 'float:right;display:flex;align-items:center;height:34px;margin:0 4px 0 6px;');
      wrap.id = 'curator-hdr';
      const btn = elt('div', 'width:30px;height:28px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;' +
        'cursor:pointer;background:#fff;border:1px solid #DADCE0;border-radius:5px;box-shadow:0 1px 2px rgba(0,0,0,.12);color:#5F6368;');
      btn.id = 'curator-tools-btn';
      btn.title = 'Пинги в Телеграм и справочник тегов';
      btn.innerHTML = BTN_SVG;
      btn.onclick = function (e) { e.stopPropagation(); togglePanel(); };
      wrap.appendChild(btn);
    }
    // держим рядом с кнопками хэлпера: перед #eduson-hdr-btns, иначе последним
    const helper = document.getElementById('eduson-hdr-btns');
    if (helper && helper.parentElement === bar) {
      if (helper.previousElementSibling !== wrap) bar.insertBefore(wrap, helper);
    } else if (bar.lastElementChild !== wrap) {
      bar.appendChild(wrap);
    }
  }

  console.log(TAG, 'запущен, версия ' + VER);
  ensureButton();
  setInterval(ensureButton, 1500);
})();
