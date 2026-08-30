// ==UserScript==
// @name         Eduson Curator — Пинги и Теги
// @namespace    eduson-curator-tools
// @version      0.10.0
// @description  Кнопка в шапке обращения OmniDesk: готовые пинги в Телеграм (с подстановкой тега, ссылки и данных студента) и поиск по справочнику тегов Эдюсон
// @author       Astanina Natalia
// @homepageURL  https://github.com/Slytherin7k/Curator-Tools
// @updateURL    https://raw.githubusercontent.com/Slytherin7k/Curator-Tools/main/curator-tools.user.js
// @downloadURL  https://raw.githubusercontent.com/Slytherin7k/Curator-Tools/main/curator-tools.user.js
// @match        https://*.omnidesk.ru/*
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      eduson.amocrm.ru
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const VER = '0.10.0';
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

  const DIPLOMA_OWNER = { name: 'Антон Трепко', tag: '@anteneshe' };

  const ESCALATIONS = [
    { name: 'Юля Проняева', tag: '@yilya_pronyaeva', note: 'справки об оплате, дипломы, негатив из чатов, претензии, сложные и негативные кейсы, непонятки по тикетам · можно в чат онбординга' },
    { name: 'Маша Киликян', tag: '@Sh_enma', note: 'закрывающие документы, справки' },
    { name: 'Лена Чубарь', tag: '@El_Chubb', note: 'ЭДО по закрывающим' },
    { name: 'Антон Трепко', tag: '@anteneshe', note: 'отправка диплома, проверка в ФИС ФРДО · замещение Маши Киликян по закрывающим' },
    { name: 'Катя Дедловская', tag: '@ededlovskaya', note: 'стажировка в IT и дизайне — тегать в чатах соответствующих кластеров' },
    { name: 'Мария Дудникова', tag: '@dudnikovamary', note: 'отключение от рассылки контактов, маркетинг' },
    { name: 'Поиск эксперта для консультации', tag: '@ededlovskaya @ChristinaErnandez', note: 'Катя Дедловская, Кристина Эрнандес · доска в Notion + чат обсуждения консультаций — задачу на доску ставим всегда' }
  ];

  // B2B — тоже департамент. Директора департаментов + B2B.
  const DIRECTORS = [
    { name: 'Александр Кобзев', tag: '@A_Kobzev', note: 'департамент Финансы и Бухгалтерия' },
    { name: 'Вагиз Шарипов', tag: '@vagiz_sh', note: 'департамент Менеджмент, МПП и HR' },
    { name: 'Алексей Семериков', tag: '@Semerikov_Aleksey', note: 'департамент Маркетинг, IT и Аналитика' },
    { name: 'Лена Чубарь', tag: '@El_Chubb', note: 'департамент B2B' },
    { name: 'Ленара Галялиева', tag: '@Lenara_Galyalieva', note: 'департамент B2B' }
  ];

  // Пинги.
  //   suggest: 'leadcontent' (лид контента → продакт кластера), 'dz' (проверяющие),
  //            'diploma' (всегда Антон Трепко), 'paymanual' (МОП по имени + тег вписывает куратор), 'none'
  //   linkKind: 'notion' | 'admin' (автозаполн. из поля АДМИНКА) | 'asana' | 'amo' (автозаполн. номером сделки)
  //   linkLabel: слово-метка перед ссылкой (в Телеграм-версии становится кликабельным)
  //   {тег} {метка+ссылка} {моп} {цитата} {имя} {email} {телефон} — подставляются.
  const PINGS = [
    { id: 'question', title: 'Завис вопрос', suggest: 'leadcontent', linkKind: 'notion', linkLabel: 'Вопрос',
      text: 'Привет, {тег}! Подвис вопрос от студента — посмотри, пожалуйста.\n{ссылка}' },
    { id: 'dz', title: 'Зависла проверка ДЗ', suggest: 'dz', linkKind: 'homework', linkLabel: 'Карточка ДЗ',
      text: 'Привет, {тег}! Подвисла проверка ДЗ — посмотри, пожалуйста.\n{ссылка}' },
    { id: 'sending', title: 'Задержка отправки диплома', suggest: 'diploma', linkKind: 'asana', linkLabel: 'Задача в Асане',
      text: 'Привет, {тег}! Подвисла отправка диплома, задержка уже большая — возьми, пожалуйста, в ближайшую очередь.\n{ссылка}' },
    { id: 'payment', title: 'Вопрос по оплате / подарочному курсу', suggest: 'paymanual', linkKind: 'amo', linkLabel: 'Сделка',
      text: 'Привет, {тег}! Студент написал в амо по оплате / подарочному курсу — свяжись с ним, пожалуйста.\n{ссылка}' },
    { id: 'lead', title: 'Новый лид', suggest: 'none', linkKind: 'amo', linkLabel: 'Сделка',
      text: '✳️ НОВЫЙ ЛИД ✳️\nВозьмите в работу, пожалуйста.\n\nСообщение клиента:\n«{цитата}»\n\n{имя}\n{email}\n{телефон}\n{ссылка}' }
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

  function amoDealNum() {
    const num = sidebarValue(/amocrm/i);
    let m = (num || '').match(/\d{5,}/);
    if (m) return m[0];
    const a = Array.from(document.querySelectorAll('a[href*="/leads/detail/"]'))
      .find(function (x) { return /leads\/detail\/\d+/.test(x.href); });
    m = a && a.href.match(/leads\/detail\/(\d+)/);
    return m ? m[1] : '';
  }
  function amoLink() {
    const n = amoDealNum();
    return n ? ('https://eduson.amocrm.ru/leads/detail/' + n) : '';
  }

  function adminLink() {
    const a = Array.from(document.querySelectorAll('.right_info_panels a[href*="eduson.tv/admin"], #info_panel_wrap a[href*="eduson.tv/admin"]'))[0];
    if (a) return a.href;
    const v = sidebarValue(/^админк/i);
    return /^https?:\/\//.test(v) ? v : '';
  }

  function autoLink(kind) {
    if (kind === 'amo') return amoLink();
    if (kind === 'admin') return adminLink();
    return ''; // notion, asana, homework — вписывает куратор
  }

  /* ---------- amoCRM: имя МОП по сделке ---------- */
  function gmFetch(url) {
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        method: 'GET', url: url, timeout: 15000,
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
        onload: function (res) {
          if (res.status === 200) {
            try { resolve(JSON.parse(res.responseText)); } catch (e) { reject(new Error('bad-json')); }
          } else if (res.status === 204) { resolve({}); }
          else if (res.status === 401 || res.status === 403) { reject(new Error('NOAUTH')); }
          else { reject(new Error('http-' + res.status)); }
        },
        onerror: function () { reject(new Error('net')); },
        ontimeout: function () { reject(new Error('timeout')); }
      });
    });
  }
  async function fetchMopName(dealNum) {
    if (!dealNum) return { name: '', sure: false };
    const base = 'https://eduson.amocrm.ru';
    // 1) служебное сообщение «Коллега … продал курс …» — это и есть МОП
    try {
      const j = await gmFetch(base + '/api/v4/leads/' + dealNum + '/notes?filter[note_type]=common&order[id]=desc&limit=250');
      const notes = ((j._embedded || {}).notes) || [];
      for (const n of notes) {
        const t = (n.params && (n.params.text || n.params.message)) || '';
        const m = t.match(/Коллега\s+(.+?)\s+продал/i);
        if (m) return { name: m[1].replace(/\s+/g, ' ').trim(), sure: true };
      }
    } catch (e) { if (e.message === 'NOAUTH') throw e; }
    // 2) запасной путь — ответственный за сделку
    try {
      const l = await gmFetch(base + '/api/v4/leads/' + dealNum);
      const uid = l && l.responsible_user_id;
      if (uid) {
        const u = await gmFetch(base + '/api/v4/users/' + uid);
        if (u && u.name) return { name: u.name, sure: false };
      }
    } catch (e) { if (e.message === 'NOAUTH') throw e; }
    return { name: '', sure: false };
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
  // Кого предложить в выборе тега.
  function suggestTags(ping, cluster) {
    if (ping.suggest === 'dz') {
      return [{ label: DZ_DEFAULT.name + ' — по умолчанию', tag: DZ_DEFAULT.tag }]
        .concat(DZ_REVIEWERS.map(function (d) { return { label: d.name, tag: d.tag }; }));
    }
    if (ping.suggest === 'diploma') {
      return [{ label: DIPLOMA_OWNER.name + ' — ответственный по дипломам', tag: DIPLOMA_OWNER.tag }];
    }
    if (ping.suggest === 'leadcontent') {
      if (!cluster || !CLUSTERS[cluster]) return [];
      const c = CLUSTERS[cluster];
      const r = [];
      if (c.lead) r.push({ label: 'Лид контента · ' + c.lead.name, tag: c.lead.tag });
      r.push({ label: 'Продакт · ' + c.product.name, tag: c.product.tag });
      return r;
    }
    return [];
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Возвращает { plain, html } — html-версия делает слово-метку кликабельной (для вставки в Telegram Desktop).
  function pingFill(ping, tag, link, mop) {
    const u = readUser();
    const quote = ping.id === 'lead' ? (firstClientMsg() || lastClientMsg()) : lastClientMsg();
    const lbl = ping.linkLabel || 'Ссылка';
    const linkPlain = link ? (lbl + ': ' + link) : (lbl + ': {вставь ссылку}');
    const linkHtml = link
      ? ('<a href="' + escapeHtml(link) + '">' + escapeHtml(lbl) + '</a>')
      : (escapeHtml(lbl) + ': {вставь ссылку}');

    function build(linkPart) {
      return ping.text
        .replace('{тег}', tag || '{тег}')
        .replace('{ссылка}', linkPart)
        .replace('{моп}', mop || '{имя МОП}')
        .replace('{цитата}', quote || '{цитата из сообщения}')
        .replace('{имя}', u.name || '{имя}')
        .replace('{email}', u.email || '{email}')
        .replace('{телефон}', u.phone || '{телефон}');
    }
    const html = escapeHtml(build('@@LINK@@')).replace('@@LINK@@', linkHtml).replace(/\n/g, '<br>');
    return { plain: build(linkPlain), html: html };
  }

  /* ==================== UI ==================== */
  function copyText(t) {
    try { GM_setClipboard(t); } catch (e) {
      try { navigator.clipboard.writeText(t); } catch (e2) {}
    }
  }

  // Копирует и обычный текст, и html (Telegram Desktop сохраняет кликабельную ссылку).
  function copyRich(plain, html) {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        navigator.clipboard.write([new window.ClipboardItem({
          'text/plain': new Blob([plain], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' })
        })]).catch(function () { copyText(plain); });
        return;
      }
    } catch (e) {}
    copyText(plain);
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
    const p = elt('div', 'position:fixed;z-index:2147483646;top:64px;right:18px;width:370px;max-height:80vh;overflow:auto;' +
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

  const LINK_META = {
    notion: { label: 'Ссылка на карточку Notion', ph: 'ссылка на карточку Notion' },
    admin: { label: 'Ссылка на карточку в админке', ph: 'https://www.eduson.tv/admin/…' },
    homework: { label: 'Ссылка на карточку ДЗ', ph: 'https://…eduson.tv/ru/dashboard/homework_attempts/…' },
    asana: { label: 'Ссылка на задачу в Asana', ph: 'ссылка на задачу в Asana' },
    amo: { label: 'Ссылка на сделку', ph: 'https://eduson.amocrm.ru/leads/detail/…' }
  };

  function showPingResult(body, ping) {
    body.innerHTML = '';
    const back = elt('div', 'font-size:11px;font-weight:800;color:' + ACC + ';cursor:pointer;margin-bottom:6px;', '‹ назад к пингам');
    back.onclick = function () { body.innerHTML = ''; renderPings(body); };
    body.appendChild(back);
    body.appendChild(elt('div', 'font-weight:800;font-size:13px;margin-bottom:2px;', ping.title));

    let lastHtml = '';

    // --- Кластер (только для 'leadcontent') ---
    let clusterSel = null;
    if (ping.suggest === 'leadcontent') {
      const cluster = detectCluster(readCourse());
      const crs = readCourse();
      body.appendChild(elt('div', fieldLabel, 'Кластер' + (cluster ? '' : ' — курс не распознан, выбери')));
      clusterSel = elt('select', inputCss);
      clusterSel.appendChild(new Option('— выбери кластер —', ''));
      CLUSTER_NAMES.forEach(function (n) { clusterSel.appendChild(new Option(n, n)); });
      clusterSel.value = cluster || '';
      body.appendChild(clusterSel);
      if (crs) body.appendChild(elt('div', 'font-size:10.5px;color:#9CA3AF;font-weight:600;margin-top:2px;', 'курс: ' + crs));
    }

    // --- МОП (только для 'paymanual') — подсказка кому писать, в текст пинга НЕ идёт ---
    let mopInput = null, mopNote = null;
    if (ping.suggest === 'paymanual') {
      body.appendChild(elt('div', fieldLabel, 'МОП сделки (для справки, в пинг не идёт)'));
      mopInput = elt('input', inputCss);
      mopInput.placeholder = 'кто вёл сделку';
      body.appendChild(mopInput);
      mopNote = elt('div', 'font-size:10.5px;color:#9CA3AF;font-weight:600;margin-top:2px;', '');
      body.appendChild(mopNote);
      const deal = amoDealNum();
      if (deal) {
        mopNote.textContent = 'ищу в амо…';
        fetchMopName(deal).then(function (r) {
          if (r.name) {
            mopInput.value = r.name;
            mopNote.textContent = r.sure ? 'из сообщения о продаже в амо' : 'ответственный за сделку в амо — проверь';
            recompute();
          } else { mopNote.textContent = 'в амо не нашла — впиши имя сам'; }
        }).catch(function (e) {
          mopNote.textContent = e && e.message === 'NOAUTH'
            ? 'амо не пустило — открой амо в соседней вкладке и вернись' : 'амо недоступно — впиши имя сам';
        });
      } else {
        mopNote.textContent = 'номера сделки в карточке нет — впиши имя сам';
      }
    }

    // --- Кому (выбор тега) ---
    let tagSel = null, manualInput = null;
    const needTag = ping.suggest !== 'none';
    if (needTag) {
      body.appendChild(elt('div', fieldLabel, ping.suggest === 'paymanual' ? 'Тег (впиши сам)' : 'Кому'));
      manualInput = elt('input', inputCss);
      manualInput.placeholder = '@тег';
      if (ping.suggest !== 'paymanual') {
        tagSel = elt('select', inputCss);
        body.appendChild(tagSel);
        manualInput.style.cssText = inputCss + 'margin-top:5px;display:none;';
      }
      body.appendChild(manualInput);
      if (ping.suggest === 'leadcontent') {
        body.appendChild(elt('div', 'font-size:10.5px;color:#9CA3AF;font-weight:600;margin-top:3px;',
          'Есть ответственный в карточке — впиши его. Нет — тег лида кластера (по умолчанию).'));
      }
    }

    // --- Ссылка ---
    const lm = LINK_META[ping.linkKind] || LINK_META.notion;
    body.appendChild(elt('div', fieldLabel, lm.label));
    const linkInput = elt('input', inputCss);
    linkInput.placeholder = lm.ph;
    linkInput.value = autoLink(ping.linkKind);
    body.appendChild(linkInput);

    // --- Превью ---
    body.appendChild(elt('div', fieldLabel, 'Текст пинга'));
    const ta = elt('textarea', 'width:100%;min-height:150px;border:1px solid #D1D5DB;border-radius:10px;padding:8px 10px;font:500 12px/1.5 ' + FONT + ';color:#111827;resize:vertical;');
    body.appendChild(ta);

    function chosenTag() {
      if (!needTag) return '';
      if (tagSel && tagSel.value !== '__manual__') return tagSel.value;
      return manualInput.value.trim();
    }
    function recompute() {
      const r = pingFill(ping, chosenTag(), linkInput.value.trim(), mopInput ? mopInput.value.trim() : '');
      ta.value = r.plain;
      lastHtml = r.html;
    }
    function fillTagSel() {
      if (!tagSel) return;
      tagSel.innerHTML = '';
      const opts = suggestTags(ping, clusterSel ? clusterSel.value : null);
      if (!opts.length) tagSel.appendChild(new Option(ping.suggest === 'leadcontent' ? '— сначала выбери кластер —' : '—', ''));
      opts.forEach(function (o) { tagSel.appendChild(new Option(o.label + '  ·  ' + o.tag, o.tag)); });
      tagSel.appendChild(new Option(ping.suggest === 'leadcontent'
        ? '— в карточке есть ответственный, впишу сам —' : '— вписать тег вручную —', '__manual__'));
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
    if (mopInput) mopInput.oninput = recompute;
    linkInput.oninput = recompute;
    ta.oninput = function () { lastHtml = ''; };

    const copyB = elt('div', 'margin-top:9px;text-align:center;background:' + ACC + ';color:#fff;font-weight:800;font-size:12px;padding:9px 0;border-radius:12px;cursor:pointer;', '📋 Копировать');
    copyB.onclick = function () {
      if (lastHtml) copyRich(ta.value, lastHtml); else copyText(ta.value);
      toast('Скопировано — вставь в нужный чат Телеграм');
    };
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
        head: { name: lead, note: 'руководитель' + (t.dept ? ' · ' + t.dept : ''), tag: t.tag },
        rows: t.mops.map(function (m) { return { name: m, tag: t.tag, note: '' }; })
      };
    });
    return [
      { title: 'Продакты по кластерам', rows: prod },
      { title: 'Лиды контента', rows: leads },
      { title: 'Проверяющие ДЗ', rows: [{ name: DZ_DEFAULT.name, tag: DZ_DEFAULT.tag, note: 'по умолчанию' }]
        .concat(DZ_REVIEWERS.map(function (d) { return { name: d.name, tag: d.tag, note: '' }; })) },
      { title: 'Эскалации', rows: ESCALATIONS.map(function (e) { return { name: e.name, tag: e.tag, note: e.note }; }) },
      { title: 'Директора департаментов', rows: DIRECTORS.map(function (d) { return { name: d.name, tag: d.tag, note: d.note }; }) },
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
      // Две строки: имя (+ примечание) сверху, тег снизу — ничего не сливается и не едет.
      const it = elt('div', 'padding:6px 8px 6px ' + (indent || 8) + 'px;border-radius:8px;cursor:pointer;');
      it.appendChild(elt('div', 'font-size:12.5px;font-weight:700;color:#111827;line-height:1.35;', row.name));
      const meta = elt('div', 'display:flex;flex-wrap:wrap;gap:4px 8px;margin-top:1px;align-items:baseline;');
      if (row.tag) meta.appendChild(elt('span', 'font:500 11.5px IBM Plex Mono,' + FONT + ';color:' + ACC_DEEP + ';', row.tag));
      else meta.appendChild(elt('span', 'font-size:11px;color:#9CA3AF;font-weight:600;', 'тега нет'));
      if (row.note) meta.appendChild(elt('span', 'font-size:11px;color:#9CA3AF;font-weight:600;', row.note));
      it.appendChild(meta);
      it.onmouseenter = function () { it.style.background = '#F0F9FF'; };
      it.onmouseleave = function () { it.style.background = 'transparent'; };
      it.onclick = function () {
        if (!row.tag) { toast('У ' + row.name + ' тега нет'); return; }
        copyText(row.tag); toast('Скопирован тег ' + row.tag);
      };
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
  // Вид кнопки — как у ключа/магнита Хэлпера, чтобы стояли ровным рядом с одинаковым зазором.
  const BTN_SVG = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  function makeCuratorBtn() {
    const btn = document.createElement('div');
    btn.id = 'curator-tools-btn';
    btn.title = 'Пинги в Телеграм и справочник тегов';
    btn.style.cssText = 'width:30px;height:28px;flex:0 0 auto;box-sizing:border-box;display:flex;align-items:center;' +
      'justify-content:center;cursor:pointer;background:#fff;border:1px solid #DADCE0;border-radius:5px;' +
      'box-shadow:0 1px 2px rgba(0,0,0,.12);color:#5F6368;transition:background .15s;';
    btn.innerHTML = BTN_SVG;
    btn.onmouseenter = function () { btn.style.background = '#F1F3F4'; };
    btn.onmouseleave = function () { btn.style.background = '#fff'; };
    btn.onclick = function (e) { e.stopPropagation(); togglePanel(); };
    return btn;
  }

  function ensureButton() {
    const bar = document.querySelector('.request-content-title-act');
    if (!bar) {
      const w = document.getElementById('curator-hdr'); if (w) w.remove();
      const b = document.getElementById('curator-tools-btn'); if (b) b.remove();
      return;
    }
    const helper = document.getElementById('eduson-hdr-btns');
    let btn = document.getElementById('curator-tools-btn');

    if (helper && helper.parentElement === bar) {
      // Хэлпер установлен — кладём кнопку последней В ЕГО контейнер: общий gap и один отступ на всю группу.
      const standalone = document.getElementById('curator-hdr');
      if (standalone) standalone.remove();
      btn = document.getElementById('curator-tools-btn');
      if (!btn) btn = makeCuratorBtn();
      if (btn.parentElement !== helper || helper.lastElementChild !== btn) helper.appendChild(btn);
      return;
    }

    // Хэлпера нет — свой контейнер в том же стиле (float:right, gap:5px, отступ справа 14px).
    let wrap = document.getElementById('curator-hdr');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'curator-hdr';
      wrap.style.cssText = 'float:right;display:flex;align-items:center;gap:5px;height:34px;margin:0 14px 0 6px;';
      wrap.appendChild((btn && !btn.parentElement) ? btn : makeCuratorBtn());
    }
    if (bar.lastElementChild !== wrap) bar.appendChild(wrap);
  }

  console.log(TAG, 'запущен, версия ' + VER);
  ensureButton();
  setInterval(ensureButton, 1500);
})();
