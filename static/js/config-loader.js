document.addEventListener('DOMContentLoaded', function() {
  const CONFIG_SELECTORS = {
    text: '[data-config-text]',
    html: '[data-config-html]',
    href: '[data-config-href]',
    array: '[data-config-array]',
    style: '[data-config-style]',
    src: '[data-config-src]',
    music: '[data-config-music]',
  };

  // ===== 工具函数 =====
  const getConfigValue = (obj, path) => 
    path.split('.').reduce((o, p) => o?.[p], obj);

  // Returns 'dark' or 'light' based on current theme (respects system preference).
  // Uses the same @media (prefers-color-scheme: light) condition as the CSS so that
  // the resolved mode always matches what the stylesheet actually renders.
  function getEffectiveThemeMode() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light') return 'light';
    if (attr === 'dark') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  const debounce = (func, wait = 100) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // ===== 骨架屏控制 =====
  // index.html 的 <head> 已在解析阶段发起 config.json 请求，
  // 这里复用那个 Promise，避免同一份配置被下载两次。
  const configRequest = window.configPromise || fetch('config.json').then(response => {
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
  });

  function revealPage() {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    document.body.removeAttribute('aria-busy');
  }

  // 图片骨架逐张退场：加载完成后收起自己的骨架，
  // 加载失败也收起，避免破图图标后面永远闪着一个假占位。
  function watchImage(img) {
    if (!img || img.dataset.skWatch === '1') return;
    img.dataset.skWatch = '1';

    const host = img.closest('.sk-host');
    const skeleton = host ? host.querySelector('[data-skeleton-img]') : null;
    let timer = null;

    const settle = () => {
      if (img.dataset.skDone === '1') return;
      img.dataset.skDone = '1';
      clearTimeout(timer);
      img.classList.add('is-loaded');
      if (skeleton) skeleton.classList.add('is-hidden');
      // 交还高度给真实图片：否则 aspect-ratio 预留的比例会残留成空白
      if (host) host.classList.add('is-img-loaded');
    };

    const fail = () => {
      if (img.dataset.skDone === '1') return;
      img.dataset.skDone = '1';
      clearTimeout(timer);
      img.classList.add('is-error');
      if (skeleton) skeleton.classList.add('is-hidden');
      // 整块收起：页面上不留空洞，也不留一个永远闪着的假占位
      if (host) host.classList.add('is-img-error');
      // 收起是静默的，出问题时不容易发现是哪张图没来，这里留一条可查的记录
      console.warn('[Homepage] 图片加载失败，已收起该区域：', img.currentSrc || img.src);
    };

    // 超时 ≠ 失败。慢网下图片可能 20 秒才到，这时候不能把它判死刑：
    // 一旦打了 is-img-error（display:none），随后即使加载成功也再没有机会露出来。
    // 所以超时只把「还在等」的骨架收起来，图片本身仍保持监听，
    // 真到了就正常显示；真的失败由 error 事件走 fail()。
    const timeout = () => {
      if (img.dataset.skDone === '1') return;
      if (img.complete && img.naturalWidth > 0) {
        settle();
        return;
      }
      // 还没到，但别再让它无限流光：收起骨架，留出图片的位置
      if (skeleton) skeleton.classList.add('is-hidden');
      if (host) host.classList.add('is-img-loaded');
    };

    if (img.complete && img.naturalWidth > 0) {
      // 缓存命中：不必等 load 事件
      settle();
      return;
    }

    img.addEventListener('load', settle, { once: true });
    img.addEventListener('error', fail, { once: true });

    // 兜底：请求既不成功也不失败（弱网、代理挂起）时，
    // 不能让它一直流光闪下去，超时后先收起骨架，但保留图片本身的机会。
    timer = setTimeout(timeout, 15000);
  }

  // ===== 配置加载 =====
  configRequest
    .then(config => {
      window.currentConfig = config;
      applyConfig(config);
      revealPage();
      if (window.Homepage) window.Homepage.config = config;
      window.dispatchEvent(new CustomEvent('configLoaded'));
    })
    .catch(error => {
      console.error('Config Error: ', error);
      revealPage();
      document.body.innerHTML = `
        <div class="flex items-center justify-center">
          Failed to load configuration: ${error.message}
        </div>
      `;
    });
  
  // ===== 配置应用主函数 =====
  function applyConfig(config) {
    // 技能图片自适应
    handleSkillImage(config);
    
    // 特殊日期处理
    handleSpecialDates(config);
    
    // 处理文本内容
    processElements(
      config, 
      CONFIG_SELECTORS.text, 
      (el, value) => { el.textContent = value; }, 
      'configText'
    );
    
    // 处理HTML内容
    processElements(
      config, 
      CONFIG_SELECTORS.html, 
      (el, value) => { el.innerHTML = value; }, 
      'configHtml'
    );
    
    // 处理链接内容
    processElements(
      config, 
      CONFIG_SELECTORS.href, 
      (el, value) => { el.href = value; }, 
      'configHref'
    );
    
    // 处理数组内容
    processElements(
      config, 
      CONFIG_SELECTORS.array, 
      (el, value, dataPath) => {
        if (dataPath === 'social') renderSocialItems(el, value);
        else if (dataPath === 'projectsList') renderProjects(el, Object.values(config.projectsList).flat());
      }, 
      'configArray'
    );
    
    // 处理样式
    processElements(
      config, 
      CONFIG_SELECTORS.style, 
      (el, value) => {
        const [styleProp] = el.dataset.configStyle.split(':');
        el.style[styleProp] = `url('${value}')`;
      }, 
      'configStyle'
    );
    
    // 处理图片源
    processElements(
      config, 
      CONFIG_SELECTORS.src, 
      (el, value) => {
        // 技能图由 handleSkillImage 负责（要按屏宽改写 perline），
        // 这里跳过，否则会用原始地址覆盖掉适配后的地址。
        if (el.id === 'skill') return;

        const isArray = Array.isArray(value);
        const hasDarkOrLightKeys =
          value &&
          typeof value === 'object' &&
          !isArray &&
          ('dark' in value || 'light' in value);

        if (hasDarkOrLightKeys) {
          // Dark/light image URL support (e.g. githubSnake)
          el.dataset.darkSrc = value.dark || value.light || '';
          el.dataset.lightSrc = value.light || value.dark || '';
          const mode = getEffectiveThemeMode();
          el.src = mode === 'dark' ? el.dataset.darkSrc : el.dataset.lightSrc;
          // Preload the alternate image immediately so theme switching is instant
          const altSrc = mode === 'dark' ? el.dataset.lightSrc : el.dataset.darkSrc;
          if (altSrc) { new Image().src = altSrc; }
        } else if (isArray) {
          // Explicitly handle array values; use the first element if available
          el.src = value.length > 0 ? value[0] : '';
        } else {
          el.src = value || '';
        }

        watchImage(el);
      }, 
      'configSrc'
    );
    
    // 处理音乐播放器
    processElements(
      config, 
      CONFIG_SELECTORS.music, 
      (container, value) => { renderMusicPlayer(container, value); }, 
      'configMusic'
    );
    
    // 页脚和调试配置
    updateFooter(config);
    processDebugConfig(config);
  }

  // ===== 辅助函数 =====
  function handleSkillImage(config) {
    const skillImg = document.getElementById('skill');
    if (!skillImg || !config.skillUrl) return;

    const updateSkillImage = debounce(() => {
      const screenWidth = window.innerWidth;
      let perline = 15;

      if (screenWidth < 640) perline = 8;
      else if (screenWidth < 1024) perline = 12;

      // 本地图（static/img/skills-8|12|15.svg）按文件名选档；
      // 仍支持 skillicons.dev 在线地址，按 perline 查询参数改写。
      let src;
      if (/skills-\d+\.svg/.test(config.skillUrl)) {
        src = config.skillUrl.replace(/skills-\d+\.svg/, `skills-${perline}.svg`);
      } else if (/[?&]perline=\d+/.test(config.skillUrl)) {
        src = config.skillUrl.replace(/([?&])perline=\d+/, `$1perline=${perline}`);
      } else {
        src = config.skillUrl;
      }

      skillImg.src = src;
      watchImage(skillImg);
    });

    updateSkillImage();
    window.addEventListener('resize', updateSkillImage);
  }

  function processElements(config, selector, processor, dataAttr) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach(el => {
      try {
        const path = el.dataset[dataAttr];
        const value = getConfigValue(config, path);
        if (value) processor(el, value, path);
      } catch (error) {
        console.error(`Error processing element:`, el, error);
      }
    });
  }

  // ===== 渲染函数 =====
  function renderSocialItems(container, items) {
    container.classList.add('flex', 'flex-wrap');
    container.innerHTML = items.map(social => `
      <a class="social-item inline-flex items-center text-current px-3 py-2 mt-2 mr-2 rounded-md transition-colors decoration-none bg-gray-500/20 hover:${social.hoverBg} hover:text-white" 
        href="${social.url}" 
        target="_blank"
        aria-label="${social.name}">
        <div class="text-lg">
          <span class="iconify" data-icon="${social.iconify}"></span>
        </div>
        ${social.iconOnly ? '' : `<div class="text-sm ml-1 font-medium">${social.name}</div>`}
      </a>
    `).join('');

    // Theme toggle segmented control — last item in the social row
    const themeControl = document.createElement('div');
    themeControl.id = 'theme-toggle';
    themeControl.setAttribute('role', 'group');
    themeControl.setAttribute('aria-label', '切换主题');
    themeControl.className = 'inline-flex items-center mt-2 mr-2 rounded-md overflow-hidden bg-gray-500/20';
    themeControl.innerHTML = `
      <button type="button" class="theme-seg" data-theme-value="light" title="浅色模式" aria-label="浅色模式" aria-pressed="false">
        <span class="iconify" data-icon="ri:sun-line"></span>
      </button>
      <button type="button" class="theme-seg" data-theme-value="dark" title="深色模式" aria-label="深色模式" aria-pressed="false">
        <span class="iconify" data-icon="ri:moon-line"></span>
      </button>
      <button type="button" class="theme-seg" data-theme-value="system" title="跟随系统" aria-label="跟随系统" aria-pressed="false">
        <span class="iconify" data-icon="ri:computer-line"></span>
      </button>
    `;
    container.appendChild(themeControl);

    // Keep aria-pressed in sync with the visual active state for assistive technologies
    const themeButtons = themeControl.querySelectorAll('.theme-seg');

    function updateThemeToggleAria() {
      themeButtons.forEach(function (button) {
        button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
      });
    }

    // Initialize ARIA state based on the current active segment
    updateThemeToggleAria();

    // Observe class changes (e.g., .active added/removed) and resync ARIA state when supported.
    // Fall back to click handlers to keep ARIA in sync when MutationObserver is unavailable.
    if (window.MutationObserver) {
      const observer = new MutationObserver(updateThemeToggleAria);
      themeButtons.forEach(function (button) {
        observer.observe(button, { attributes: true, attributeFilter: ['class'] });
      });
    } else {
      themeButtons.forEach(function (button) {
        button.addEventListener('click', updateThemeToggleAria);
      });
    }
  }

  function renderProjects(container, projects) {
    container.innerHTML = projects.map(project => `
      <a class="project-item px-4 py-3 text-current rounded-md transition-colors decoration-none bg-gray-400/10 hover:bg-gray-400/20" 
         href="${project.url}" 
         target="_blank"
         aria-label="${project.title}">
        <div class="flex h-full items-center justify-center">
          <div class="flex-1 flex-col">
            <div class="font-medium leading-relaxed flex items-center justify-between">
              <span>${project.title}</span>
            </div>
            <div class="opacity-50 font-normal text-sm">
              ${project.description}
            </div>
          </div>
          <div class="ml-4 text-4xl opacity-80">
            <span class="iconify" data-icon="${project.iconify}"></span>
          </div>
        </div>
      </a>
    `).join('');
  }

  // Meting API 默认地址模板（自托管）。配置里写了 music.api 就用配置的；
  // 没写的话，custom.js 里若定义过 window.meting_api 仍然优先，最后才落到这里。
  // 这样 custom.js 只是「方便改」的入口，删掉它音乐也不会坏。
  const DEFAULT_METING_API = 'https://api.nxvav.cn/api/music/?server=:server&type=:type&id=:id&auth=:auth&r=:r';

  // MetingJS 2.0.2 拉列表那一行是 `fetch(url).then(res => res.json())`，不看状态码。
  // 音乐 API 挂掉或返回 404 页面时，它会把整段 HTML 丢进 JSON.parse，
  // 抛出一个没人 catch 的 SyntaxError 冒到控制台（每个访客都看得到一条红色报错）。
  // 这里只包一层「音乐 API」的请求：非 JSON 响应换成空数组，播放器安静地显示空列表，
  // 其它请求一律原样放行，不影响页面其它部分。
  function guardMetingFetch(apiTemplate) {
    if (window.__metingFetchGuarded || typeof window.fetch !== 'function') return;

    let base = null;
    try {
      const raw = String(apiTemplate);
      // 第二种参数是 base：既能吃绝对地址，也能吃 "/meting/?..." 这样的相对路径
      const parsed = new URL(raw.startsWith('//') ? window.location.protocol + raw : raw, window.location.href);
      base = parsed.origin + parsed.pathname;
    } catch (e) {
      base = null;
    }
    if (!base) return;

    const originalFetch = window.fetch;
    const emptyList = () => new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    window.__metingFetchGuarded = true;
    window.fetch = function (input) {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const promise = originalFetch.apply(this, arguments);
      if (!String(url).startsWith(base)) return promise;

      return promise.then(response => {
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('json')) return response;
        return emptyList();
      }, emptyList);
    };
  }

  function renderMusicPlayer(container, musicConfig) {
    if (!musicConfig || !musicConfig.enabled) {
      container.innerHTML = '';
      return;
    }

    const {
      server = '',
      type = '',
      id = '',
      fixed = false,
      mini = false,
      autoplay = false,
      theme = '',
      loop = 'all',
      order = 'list',
      preload = 'auto',
      volume = 0.7,
      mutex = true,
      lrcEnabled = false,
      listFolded = false,
      listMaxHeight = '340px',
      storageName = 'metingjs',
      api = ''
    } = musicConfig;

    const metingEl = document.createElement('meting-js');
    const attributes = {
      server,
      type,
      id,
      // 优先级：music.api > custom.js 的 window.meting_api > 内置默认值
      api: api || window.meting_api || DEFAULT_METING_API,
      fixed: fixed.toString(),
      mini: mini.toString(),
      autoplay: autoplay.toString(),
      theme,
      loop: ['all', 'one', 'none'].includes(loop) ? loop : 'all',
      order: ['list', 'random'].includes(order) ? order : 'list',
      preload: ['none', 'metadata', 'auto'].includes(preload) ? preload : 'auto',
      volume: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].includes(volume) ? volume : 0.7,
      mutex: mutex.toString(),
      'lrc-type': lrcEnabled ? undefined : '0',
      'list-folded': listFolded.toString(),
      'list-max-height': listMaxHeight,
      'storage-name': storageName
    };

    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined) metingEl.setAttribute(key, value);
    });

    guardMetingFetch(attributes.api);

    container.innerHTML = '';
    container.appendChild(metingEl);
  }

  // ===== 特殊日期处理 =====
  // 节日预设：配置里只写「日期 + 表情 + 文案 + 主色」，成段的 CSS 由这里生成。
  // 原来 11 条节日把同一套 background-clip / text-shadow 抄了 9 遍，
  // 占到 config.json 的一半以上，改样式还得逐条改。
  const EFFECT_DURATION = {
    sparkle: '2s',
    pulse: '1.5s',
    wave: '3s',
    bounce: '1s',
    glow: '2s',
    shimmer: '3s'
  };

  const MEMORIAL_STYLE = 'filter: grayscale(100%); -webkit-filter: grayscale(100%);';

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex).trim());
    if (!m) return [255, 255, 255];
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }

  function gradientTextStyle(colors, weight, effect) {
    const palette = (Array.isArray(colors) && colors.length ? colors : ['#8b5cf6', '#ec4899']).join(', ');
    const [r, g, b] = hexToRgb(colors && colors[0]);
    const blur = weight >= 800 ? 10 : 8;

    let css =
      `background: linear-gradient(90deg, ${palette});` +
      ' -webkit-background-clip: text; background-clip: text; color: transparent;' +
      ` font-weight: ${weight};` +
      ` text-shadow: 0 0 ${blur}px rgba(${r}, ${g}, ${b}, 0.3);`;

    if (effect && EFFECT_DURATION[effect]) {
      css += ` animation: ${effect} ${EFFECT_DURATION[effect]} infinite alternate;`;
    }
    // glow / sparkle 的关键帧要跟着主色走，否则换个色号光晕还是红的
    if (effect === 'glow' || effect === 'sparkle') {
      css += ` --glow-rgb: ${r}, ${g}, ${b};`;
    }
    return css;
  }

  // 把一条节日配置规整成 { description, style, target }
  function resolveSpecialDate(entry) {
    const emoji = entry.emoji ? `<span class='emoji'>${entry.emoji}</span> ` : '';
    const description = emoji + (entry.text || '');

    if (entry.effect === 'memorial') {
      return { description, style: MEMORIAL_STYLE, target: 'global' };
    }

    return {
      description,
      style: gradientTextStyle(entry.colors, entry.weight || 700, entry.effect),
      target: entry.target || 'description'
    };
  }

  function handleSpecialDates(config) {
    if (config.enableSpecialDates === false) return;
    if (!Array.isArray(config.specialDates)) return;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    for (const entry of config.specialDates) {
      if (!isDateMatch(entry, today, year, month, date)) continue;

      const resolved = resolveSpecialDate(entry);

      // 应用节日描述
      if (resolved.description && config.profile) {
        config.profile.description = resolved.description;
      }

      // 应用节日样式
      if (resolved.style) {
        if (resolved.target === 'global') {
          applySpecialDayStyles(resolved.style);
        } else {
          applyDescriptionStyle(resolved.style);
        }
      }
      break;
    }
  }

  function isDateMatch(entry, today, year, month, date) {
    // 单日节日：m / d
    if (entry.d !== undefined && entry.from === undefined) {
      return entry.m === month && entry.d === date;
    }

    // 日期范围：from / to，两端都包含
    if (entry.from && entry.to) {
      const [startMonth, startDay] = String(entry.from).split('-').map(Number);
      const [endMonth, endDay] = String(entry.to).split('-').map(Number);

      if ([startMonth, startDay, endMonth, endDay].some(Number.isNaN)) {
        console.warn('specialDates 日期格式有误，应为 "月-日"：', entry);
        return false;
      }

      const startDate = new Date(year, startMonth - 1, startDay);
      const endDate = new Date(year, endMonth - 1, endDay + 1);

      return today >= startDate && today < endDate;
    }

    return false;
  }

  function applySpecialDayStyles(style) {
    const html = document.documentElement;
    
    // Tailwind 类名处理
    if (!style.includes(':')) {
      html.classList.add(...style.split(' '));
      return;
    }
    
    // CSS 样式处理
    const styleId = 'special-day-styles';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `html { ${style} }`;
  }

  function applyDescriptionStyle(style) {
    const descriptionElements = document.querySelectorAll('[data-config-html="profile.description"]');
    
    descriptionElements.forEach(el => {
      // 清除之前可能添加的样式
      el.removeAttribute('style');
      el.className = el.className.replace(/bg-gradient-to-r\s+from-[^\s]+\s+via-[^\s]+\s+to-[^\s]+/g, '');
      
      // 应用新样式
      if (!style.includes(':')) {
        // Tailwind 类名处理
        el.classList.add(...style.split(' '));
      } else {
        // CSS 样式处理
        el.setAttribute('style', style);
      }
    });
  }

  // ===== 其他功能 =====
  function updateFooter(config) {
    const footer = document.querySelector('footer');
    if (!footer || typeof config.footer !== 'string') return;
    footer.innerHTML = config.footer;
  }

  function processDebugConfig(config) {
    window.debugConfig = config.debug || {};
  }

  // 暴露配置值获取方法
  window.getConfigValue = getConfigValue;

  // ===== 给自定义脚本用的稳定接口 =====
  // custom.js 之类的自定义脚本不要去摸内部函数，用这个就好：
  //   Homepage.get('profile.name')                 按路径取值
  //   Homepage.onConfigLoaded(cfg => { ... })      配置就绪后执行（已就绪则立刻执行）
  //   Homepage.config                              原始配置对象
  window.Homepage = {
    config: null,
    // 单参数版本：内部 getConfigValue 是 (obj, path)，别直接把两参函数暴露出去
    get(path) {
      return getConfigValue(window.Homepage.config, path);
    },
    onConfigLoaded(callback) {
      if (typeof callback !== 'function') return;
      if (window.Homepage.config) {
        callback(window.Homepage.config);
        return;
      }
      window.addEventListener('configLoaded', function handler() {
        window.removeEventListener('configLoaded', handler);
        callback(window.Homepage.config);
      });
    }
  };
});
