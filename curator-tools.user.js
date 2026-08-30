// ==UserScript==
// @name         Eduson Curator — Пинги и Теги
// @namespace    eduson-curator-tools
// @version      0.2.0
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

  const VER = '0.2.0';
  const TAG = '[curator-tools]';
  const ACC = '#0284C7';
  const ACC_DEEP = '#075985';
  const ACC_BD = '#BAE6FD';
  const FONT = 'Nunito, system-ui, -apple-system, "Segoe UI", sans-serif';

  /* ==================== СПРАВОЧНИК ==================== */
  // Кластеры: продакт + лид контента + ключевые слова курса для автоподсказки.
  // Автоподсказка — не обязательна: в панели всегда можно выбрать кластер вручную.
  const CLUSTERS = {
    'Менеджмент': {
      product: { name: 'Александр Зырянов', tag: '@alexanderzyryanov' },
      lead: { name: 'Наталья Сухаг', tag: '@nataliya_suhag' },
      kw: ['коммерческ', 'генеральн', 'исполнительн', ' ceo', 'роп ', 'управление командами', 'управление командой',
           'директор по продаж', 'менеджер отдела продаж', 'менеджер по продаж', 'отдел продаж', 'soft skills',
           'софт скилл', 'софт-скилл', 'управление продажами', 'тайм-менеджмент', 'тайм менеджмент',
           'бизнес-консультант', 'бизнес консультант', 'директор по закупкам', 'клиентск', 'категорийн',
           'антикризис', 'малым бизнесом', 'госзакуп', 'управление закупками', 'для отдела продаж', 'руководител',
           'лидер', 'управление медицинск', 'менеджмент', 'управление персоналом организации', 'операционн управлени']
    },
    'Финансы': {
      product: { name: 'Зоя Гавриленко', tag: '@zoya_vlady' },
      lead: { name: 'Денис Соболев', tag: '@densoboldr' },
      kw: ['финанс', 'финдир', 'управление финансами', 'операционный директор', 'экономик', 'управление предприятием',
           'операционное управление', 'финансовое моделир', 'фин модел', 'стратегическому развитию',
           'стратегическое управление', 'нефинансист', 'по строительству', 'по производству', 'инвестицион',
           'emba', 'мсфо', 'бюджетир', 'казначей', 'управленческий учёт', 'управленческий учет']
    },
    'Бухгалтерия': {
      product: { name: 'Джу', tag: '@hey_juliko' },
      lead: { name: 'Алан Гадзаонов', tag: '@alangadzaonov' },
      kw: ['бухгалтер', 'бухучёт', 'бухучет', 'бухгалтерск', ' 1с', '1с:', 'зарплата и кадры', 'основы учёта',
           'основы учета', 'excel', 'эксель', 'google-таблиц', 'гугл-таблиц', 'ms office', 'мастер презентаций',
           'право для бизнеса', 'внутренний аудитор', 'аудит', 'налог', 'ндс', 'усн', 'первичк',
           'кадровое делопроизводств']
    },
    'Маркетинг и дизайн': {
      product: { name: 'Александр Шамша', tag: '@Ashamsha' },
      lead: { name: 'Анастасия Злобина', tag: '@zlobina_nastya' },
      kw: ['маркетолог', 'маркетинг', 'smm', 'смм', 'копирайт', 'веб-дизайн', 'веб дизайн', 'графическ дизайн',
           'дизайнер', 'дизайн интерьер', 'трафик', 'таргет', 'контекстн реклам', 'seo', 'сео', 'реклам',
           'бренд', 'пиар', ' pr ', 'контент-маркет', 'интерьер', '3ds max', '3д макс', '3d max', 'revit',
           'autodesk', 'фотошоп', 'photoshop', 'figma', 'фигма']
    },
    'IT и Аналитика': {
      product: { name: 'Дмитрий Пронин', tag: '@Dmitriy_PR0' },
      lead: { name: 'Екатерина Гудовская', tag: '@egudovskaia' },
      kw: ['аналитик', 'data science', 'дата сайнс', 'датасайнс', 'power bi', 'sql', ' bi ', ' bi:', 'python',
           'питон', 'frontend', 'фронтенд', 'бэкенд', 'backend', 'fullstack', 'фулстек', 'веб-разработчик',
           'веб разработчик', 'разработчик', 'разработк', 'программир', 'программист', 'кодинг', 'coding',
           'vibe coding', 'вайб', 'тестировщик', 'тестирован', 'qa', 'it-директор', 'it директор', 'it-специалист',
           'айти', 'devops', 'девопс', 'кибербез', 'информационн безопасн', 'базы данных', ' java', 'javascript',
           'c++', 'nocode', 'ноукод', 'low-code', 'машинн обучени', 'ml ', 'нейросет']
    },
    'МПП (маркетплейсы, проекты, продакт)': {
      product: { name: 'Михаил Свирин', tag: '@mikhail_svirin' },
      lead: { name: 'Анна Серебрякова', tag: '@serebryaka' },
      kw: ['менеджер проект', 'маркетплейс', 'продакт', 'продукт-менеджер', 'продуктовый', 'управление проект',
           'проектами', 'project manager', 'проджект', 'по логистике', 'логист', 'склад', 'wildberries',
           'вайлдберриз', ' wb ', 'ozon', 'озон', 'поставк', 'цифровое предприним', 'cpo', 'проектного офиса',
           'управление логистикой', 'цепями поставок', 'цепочк поставок', 'инженер пто', 'птo', 'autocad',
           'автокад', 'в строительстве', 'управление строит', 'девелопмент']
    },
    'HR и психология': {
      product: { name: 'Анна Фирсова', tag: '@yatriks' },
      lead: { name: 'Алиса Арцыман', tag: '@alicearts' },
      kw: ['психолог', 'психотерап', ' hr', 'hr-', 'hr:', 'эйчар', 'управлению персоналом', 'управление персоналом',
           'подбор персонала', 'рекрут', 'рекрутер', 'адаптац персонал', 'обучение и развитие', 't&d', 'методист',
           'методолог', 'образовательн программ', 'продюсер онлайн', 'продюсер курс', 'онлайн-репетитор',
           'репетитор', 'развитие персонала', 'кадровое делопроизводств', 'бизнес-ассистент', 'ассистент руковод',
           'mini-mba', 'мини-mba', 'коуч', 'наставник']
    },
    'Отраслевое управление': {
      product: { name: 'Алиса Затона', tag: '@alisa_zatona' },
      lead: null,
      kw: ['отраслев', 'госсектор', 'государственн управлени', 'медицинск организац', 'управление в образован']
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
      kw: ['детск', 'для детей', 'школьник', 'подростк', 'для ребёнк', 'для ребенк']
    }
  };
  const CLUSTER_NAMES = Object.keys(CLUSTERS);

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

  // Пинги. suggest — кого предлагать в выборе тега:
  //   'leads'  — продакт + лид контента кластера (кластер выбирается/меняется в панели)
  //   'dz'     — проверяющие ДЗ (по умолчанию — Мария Старцева)
  //   'teams'  — руководители команд продаж (11)
  //   'none'   — тег не нужен
  // linkKind — какую ссылку подставить по кнопке «взять из карточки»: 'amo' или '' (Notion — вписывает куратор).
  // {тег} {ссылка} {цитата} {имя} {email} {телефон} — подставляются.
  const PINGS = [
    { id: 'question', title: 'Завис вопрос', suggest: 'leads', linkKind: '',
      text: 'Привет, {тег}! Подвис вопрос от студента — посмотри, пожалуйста.\nВопрос: {ссылка}' },
    { id: 'dz', title: 'Зависла проверка ДЗ', suggest: 'dz', linkKind: '',
      text: 'Привет, {тег}! Подвисла проверка ДЗ — посмотри, пожалуйста.\nДЗ: {ссылка}' },
    { id: 'sending', title: 'Задержка отправки', suggest: 'leads', linkKind: '',
      text: 'Привет, {тег}! Подвисла отправка, задержка уже большая — возьми, пожалуйста, в ближайшую очередь.\nОтправка: {ссылка}' },
    { id: 'payment', title: 'Вопрос по оплате / подарочному', suggest: 'teams', linkKind: 'amo',
      text: 'Привет, {тег}! Студент написал в амо по оплате / подарочному сертификату — свяжись с ним, пожалуйста.\nСделка: {ссылка}' },
    { id: 'lead', title: 'Новый лид', suggest: 'none', linkKind: 'amo',
      text: '✳️ НОВЫЙ ЛИД ✳️\nВозьмите в работу, пожалуйста.\n\nСообщение клиента:\n«{цитата}»\n\n{имя} · {email} · {телефон}\nСделка: {ссылка}' }
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
    if (a) return a.href;
    // номер сделки из сайдбара («AMOCRM (ИЗ ЗАДАЧ ПО ЗАКРЫТЫМ СДЕЛКАМ)»)
    const num = sidebarValue(/amocrm/i);
    const m = (num || '').match(/\d{5,}/);
    return m ? ('https://eduson.amocrm.ru/leads/detail/' + m[0]) : '';
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
  // Кого предложить в выборе тега для пинга и кластера.
  function suggestTags(ping, cluster) {
    if (ping.suggest === 'dz') {
      return [{ label: DZ_DEFAULT.name + ' — по умолчанию', tag: DZ_DEFAULT.tag }]
        .concat(DZ_REVIEWERS.map(function (d) { return { label: d.name, tag: d.tag }; }));
    }
    if (ping.suggest === 'teams') {
      return Object.keys(TEAMS).map(function (lead) {
        return { label: lead + (TEAMS[lead].dept ? ' · ' + TEAMS[lead].dept : ''), tag: TEAMS[lead].tag };
      });
    }
    if (ping.suggest === 'leads') {
      if (!cluster || !CLUSTERS[cluster]) return [];
      const c = CLUSTERS[cluster];
      const r = [{ label: 'Продакт · ' + c.product.name, tag: c.product.tag }];
      if (c.lead) r.push({ label: 'Лид контента · ' + c.lead.name, tag: c.lead.tag });
      return r;
    }
    return [];
  }

  function pingFill(ping, tag, link) {
    const u = readUser();
    const quote = ping.id === 'lead' ? (firstClientMsg() || lastClientMsg()) : lastClientMsg();
    return ping.text
      .replace('{тег}', tag || '{тег}')
      .replace('{ссылка}', link || '{вставь ссылку}')
      .replace('{цитата}', quote || '{цитата из сообщения}')
      .replace('{имя}', u.name || '{имя}')
      .replace('{email}', u.email || '{email}')
      .replace('{телефон}', u.phone || '{телефон}');
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
    PINGS.forEach(function (ping) {
      const row = elt('div', 'border:1px solid #E5E7EB;border-radius:12px;padding:9px 11px;margin-bottom:7px;cursor:pointer;font-weight:800;font-size:12.5px;');
      row.textContent = ping.title;
      row.onclick = function () { showPingResult(body, ping); };
      row.onmouseenter = function () { row.style.borderColor = ACC_BD; row.style.background = '#F0F9FF'; };
      row.onmouseleave = function () { row.style.borderColor = '#E5E7EB'; row.style.background = '#fff'; };
      body.appendChild(row);
    });
  }

  const fieldLabel = 'font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#9CA3AF;margin:10px 0 3px;';
  const inputCss = 'width:100%;padding:7px 10px;border:1px solid #D1D5DB;border-radius:9px;font:600 12.5px ' + FONT + ';color:#111827;background:#fff;';

  function showPingResult(body, ping) {
    body.innerHTML = '';
    const back = elt('div', 'font-size:11px;font-weight:800;color:' + ACC + ';cursor:pointer;margin-bottom:6px;', '‹ назад к пингам');
    back.onclick = function () { body.innerHTML = ''; renderPings(body); };
    body.appendChild(back);
    body.appendChild(elt('div', 'font-weight:800;font-size:13px;margin-bottom:2px;', ping.title));

    let cluster = ping.suggest === 'leads' ? detectCluster(readCourse()) : null;
    let manualTag = '';

    // --- Кластер (только для 'leads') ---
    let clusterSel = null;
    if (ping.suggest === 'leads') {
      body.appendChild(elt('div', fieldLabel, 'Кластер' + (cluster ? '' : ' — курс не распознан, выбери')));
      clusterSel = elt('select', inputCss);
      clusterSel.appendChild(new Option('— выбери кластер —', ''));
      CLUSTER_NAMES.forEach(function (n) { clusterSel.appendChild(new Option(n, n)); });
      clusterSel.value = cluster || '';
      const crs = readCourse();
      if (crs) body.appendChild(elt('div', 'font-size:10.5px;color:#9CA3AF;font-weight:600;margin-top:1px;', 'курс: ' + crs));
      body.appendChild(clusterSel);
    }

    // --- Кому (выбор тега) ---
    let tagSel = null, manualInput = null;
    if (ping.suggest !== 'none') {
      body.appendChild(elt('div', fieldLabel, 'Кому'));
      tagSel = elt('select', inputCss);
      manualInput = elt('input', inputCss + 'margin-top:5px;display:none;');
      manualInput.placeholder = '@тег вручную';
      body.appendChild(tagSel);
      body.appendChild(manualInput);
    }

    // --- Ссылка ---
    body.appendChild(elt('div', fieldLabel, ping.linkKind === 'amo' ? 'Ссылка на сделку' : 'Ссылка на карточку Notion'));
    const linkInput = elt('input', inputCss);
    linkInput.placeholder = ping.linkKind === 'amo' ? 'https://eduson.amocrm.ru/leads/detail/…' : 'ссылка на карточку Notion';
    if (ping.linkKind === 'amo') linkInput.value = amoLink() || '';
    body.appendChild(linkInput);

    // --- Превью ---
    body.appendChild(elt('div', fieldLabel, 'Текст пинга'));
    const ta = elt('textarea', 'width:100%;min-height:150px;border:1px solid #D1D5DB;border-radius:10px;padding:8px 10px;font:500 12px/1.5 ' + FONT + ';color:#111827;resize:vertical;');
    body.appendChild(ta);

    function chosenTag() {
      if (!tagSel) return '';
      if (tagSel.value === '__manual__') return manualInput.value.trim();
      return tagSel.value;
    }
    function recompute() { ta.value = pingFill(ping, chosenTag(), linkInput.value.trim()); }
    function fillTagSel() {
      if (!tagSel) return;
      tagSel.innerHTML = '';
      const opts = suggestTags(ping, clusterSel ? clusterSel.value : null);
      if (!opts.length) tagSel.appendChild(new Option(ping.suggest === 'leads' ? '— сначала выбери кластер —' : '—', ''));
      opts.forEach(function (o) { tagSel.appendChild(new Option(o.label + '  ·  ' + o.tag, o.tag)); });
      tagSel.appendChild(new Option('— вписать тег вручную —', '__manual__'));
      tagSel.value = opts.length ? opts[0].tag : '';
      manualInput.style.display = 'none';
    }
    fillTagSel();
    recompute();

    if (clusterSel) clusterSel.onchange = function () { fillTagSel(); recompute(); };
    if (tagSel) tagSel.onchange = function () {
      manualInput.style.display = tagSel.value === '__manual__' ? 'block' : 'none';
      recompute();
    };
    if (manualInput) manualInput.oninput = recompute;
    linkInput.oninput = recompute;

    const copyB = elt('div', 'margin-top:9px;text-align:center;background:' + ACC + ';color:#fff;font-weight:800;font-size:12px;padding:9px 0;border-radius:12px;cursor:pointer;', '📋 Копировать');
    copyB.onclick = function () { copyText(ta.value); toast('Скопировано — вставь в нужный чат Телеграм'); };
    body.appendChild(copyB);
  }

  // Вкладка «Теги» — отдельные разделы, внутри «Команд продаж» — подразделы по руководителям.
  function buildTagSections() {
    const prod = [], leads = [];
    CLUSTER_NAMES.forEach(function (name) {
      const c = CLUSTERS[name];
      const kw = (c.kw || []).join(' ');
      prod.push({ name: name + ' — ' + c.product.name, tag: c.product.tag, note: c.note || '', kw: kw });
      if (c.lead) leads.push({ name: name + ' — ' + c.lead.name, tag: c.lead.tag, note: '', kw: kw });
    });
    const teams = Object.keys(TEAMS).map(function (lead) {
      const t = TEAMS[lead];
      return {
        head: { name: lead + ' — руководитель', tag: t.tag, note: t.dept },
        rows: t.mops.map(function (m) { return { name: m, tag: t.tag, note: 'МОП · команда ' + lead }; })
      };
    });
    return [
      { title: 'Продакты по кластерам', rows: prod },
      { title: 'Лиды контента', rows: leads },
      { title: 'Проверяющие ДЗ', rows: [{ name: DZ_DEFAULT.name + ' — по умолчанию', tag: DZ_DEFAULT.tag, note: '' }]
        .concat(DZ_REVIEWERS.map(function (d) { return { name: d.name, tag: d.tag, note: '' }; })) },
      { title: 'Эскалации', rows: ESCALATIONS.map(function (e) { return { name: e.name, tag: e.tag, note: e.note }; }) },
      { title: 'Команды продаж (МОП)', teams: teams }
    ];
  }
  const TAG_SECTIONS = buildTagSections();

  function matchRow(row, terms) {
    if (!terms.length) return true;
    const hay = (row.name + ' ' + row.tag + ' ' + (row.note || '') + ' ' + (row.kw || '')).toLowerCase().replace(/ё/g, 'е');
    return terms.every(function (t) { return hay.indexOf(t) !== -1; });
  }

  function renderTags(body) {
    const q = elt('input', 'width:100%;padding:8px 11px;border:1px solid #D1D5DB;border-radius:10px;font:600 13px ' + FONT + ';color:#111827;margin-bottom:8px;');
    q.type = 'search';
    q.placeholder = 'Поиск: МОП, кластер, имя, тег…';
    body.appendChild(q);
    const host = elt('div', '');
    body.appendChild(host);

    function tagRow(row, indent) {
      const it = elt('div', 'display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:5px 6px 5px ' + (indent || 6) + 'px;border-radius:8px;cursor:pointer;');
      it.appendChild(elt('div', 'font-size:12px;font-weight:700;color:#111827;flex:1;', row.name + (row.note ? '  ·  ' + row.note : '')));
      it.appendChild(elt('div', 'font:500 11.5px IBM Plex Mono,' + FONT + ';color:' + ACC_DEEP + ';white-space:nowrap;', row.tag));
      it.onmouseenter = function () { it.style.background = '#F0F9FF'; };
      it.onmouseleave = function () { it.style.background = 'transparent'; };
      it.onclick = function () { copyText(row.tag); toast('Скопирован тег ' + row.tag); };
      return it;
    }
    function collapsible(titleText, count, openByDefault) {
      const wrap = elt('div', 'border-bottom:1px solid #EEF2F5;');
      const head = elt('div', 'display:flex;justify-content:space-between;align-items:center;cursor:pointer;padding:8px 4px;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#6B7280;');
      const cont = elt('div', 'padding-bottom:6px;' + (openByDefault ? '' : 'display:none;'));
      const caret = elt('span', 'color:#9CA3AF;font-size:10px;', openByDefault ? '▲' : '▼');
      head.appendChild(elt('span', '', titleText + '  (' + count + ')'));
      head.appendChild(caret);
      head.onclick = function () {
        const open = cont.style.display === 'none';
        cont.style.display = open ? 'block' : 'none';
        caret.textContent = open ? '▲' : '▼';
      };
      wrap.appendChild(head); wrap.appendChild(cont);
      wrap._open = function () { cont.style.display = 'block'; caret.textContent = '▲'; };
      wrap._cont = cont;
      return wrap;
    }

    function draw() {
      const terms = q.value.trim().toLowerCase().replace(/ё/g, 'е').split(/\s+/).filter(Boolean);
      const searching = terms.length > 0;
      host.innerHTML = '';
      let anyHit = false;

      TAG_SECTIONS.forEach(function (sec) {
        if (sec.teams) {
          let teamMatches = [];
          sec.teams.forEach(function (t) {
            const hRows = t.rows.filter(function (r) { return matchRow(r, terms); });
            const headHit = matchRow(t.head, terms);
            if (searching && !headHit && !hRows.length) return;
            teamMatches.push({ t: t, rows: searching ? (headHit ? t.rows : hRows) : t.rows });
          });
          if (searching && !teamMatches.length) return;
          const total = teamMatches.reduce(function (a, x) { return a + x.rows.length + 1; }, 0);
          const box = collapsible(sec.title, total, searching);
          teamMatches.forEach(function (tm) {
            const sub = collapsible('  ' + tm.t.head.name.replace(' — руководитель', ''), tm.rows.length, searching);
            sub._cont.appendChild(tagRow(tm.t.head, 10));
            tm.rows.forEach(function (r) { sub._cont.appendChild(tagRow(r, 20)); });
            box._cont.appendChild(sub);
          });
          host.appendChild(box);
          anyHit = true;
        } else {
          const rows = sec.rows.filter(function (r) { return matchRow(r, terms); });
          if (searching && !rows.length) return;
          const box = collapsible(sec.title, rows.length, searching || sec.title === 'Продакты по кластерам');
          rows.forEach(function (r) { box._cont.appendChild(tagRow(r)); });
          host.appendChild(box);
          anyHit = true;
        }
      });
      if (!anyHit) host.appendChild(elt('div', 'color:#9CA3AF;font-weight:700;font-size:12px;padding:14px 0;text-align:center;', 'Ничего не найдено'));
    }
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
