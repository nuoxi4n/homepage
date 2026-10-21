console.log(
  "\n %c zyyo.net & nuoxian %c https://nuoxiana.cn",
  "color:#777777;background:linear-gradient(to right,#ebf2ed,#e5ebee,#f0e5c7,#f8eef0);padding:5px 0;",
  "color:#fff;background:#f8f8f8;padding:5px 10px 5px 0px;"
);

// ===== 主题切换功能 =====
(function initTheme() {
  // NOTE: 此键名必须与 index.html <head> 内联脚本中的键名保持一致
  const STORAGE_KEY = 'theme-preference';
  const THEMES = ['system', 'light', 'dark'];

  function getTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.includes(stored)) {
        return stored;
      }
    } catch (e) {
      // Ignore storage errors and fall back to default
    }
    // 默认深色：没存过偏好时不去跟随系统，避免浅色系统下一进来是亮的。
    // 与 index.html <head> 的防闪脚本、index.css 的媒体查询保持一致。
    return 'dark';
  }

  // Returns the resolved display mode ('dark' or 'light') for a given theme setting.
  // 'system' follows the CSS @media (prefers-color-scheme: light) rule so the snake
  // image always matches what the stylesheet actually renders.
  function getEffectiveMode(theme) {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return theme;
  }

  function updateSnakeImage(theme) {
    const snake = document.getElementById('github-snake');
    if (!snake || (!snake.dataset.darkSrc && !snake.dataset.lightSrc)) return;
    const mode = getEffectiveMode(theme);
    snake.src = mode === 'dark'
      ? (snake.dataset.darkSrc || snake.dataset.lightSrc)
      : (snake.dataset.lightSrc || snake.dataset.darkSrc);
  }

  function updateUI(theme) {
    // Highlight the active segment in the segmented control
    document.querySelectorAll('#theme-toggle .theme-seg').forEach(seg => {
      seg.classList.toggle('active', seg.dataset.themeValue === theme);
    });
    updateSnakeImage(theme);
  }

  function applyTheme(theme) {
    // Ensure the theme is always one of the allowed values
    if (!THEMES.includes(theme)) {
      theme = 'system';
    }

    const html = document.documentElement;
    if (theme === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Ignore storage errors; theme is still applied to the DOM
    }

    updateUI(theme);
  }

  // Event delegation — clicking a segment sets that theme directly
  document.addEventListener('click', function (e) {
    const target = e.target instanceof Element ? e.target : (e.target && e.target.parentElement);
    if (!target) return;
    const seg = target.closest('[data-theme-value]');
    if (seg && target.closest('#theme-toggle')) {
      applyTheme(seg.dataset.themeValue);
    }
  });

  // Initialize segment highlight once config (and the control) is loaded
  window.addEventListener('configLoaded', function () {
    updateUI(getTheme());
  });

  // Update snake image when OS-level dark/light preference changes (system mode only).
  // Listen on the 'light' mql so the change logic mirrors the CSS @media rule.
  var mql = window.matchMedia('(prefers-color-scheme: light)');
  var handleColorSchemeChange = function () {
    if (getTheme() === 'system') {
      updateSnakeImage('system');
    }
  };
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handleColorSchemeChange);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(handleColorSchemeChange);
  }
}());

// ===== FPS 显示功能 =====
function initFPS() {
  // 创建 FPS 元素
  const fpsElement = document.createElement('div');
  fpsElement.id = 'fps';
  
  // 设置样式类
  fpsElement.className = `
    z-50 fixed top-2 left-2
    font-mono text-xs sm:text-sm
    bg-black bg-opacity-70 text-green-400
    px-2 py-1 rounded
    shadow-md
    transition-opacity duration-300
    hover:opacity-100
  `;
  
  // 初始设置为半透明，减少干扰
  fpsElement.style.opacity = '0.7';
  
  // 添加到文档
  document.body.appendChild(fpsElement);

  // 兼容性处理
  const requestAnimationFrame = 
    window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame || 
    window.msRequestAnimationFrame;

  // FPS 计算变量
  let fps = 0, 
      last = Date.now(), 
      frameCount = 0;

  // FPS 更新函数
  function update() {
    frameCount++;
    const now = Date.now();
    const delta = now - last;

    // 每秒更新一次 FPS 显示
    if (delta >= 1000) {
      fps = Math.round((frameCount * 1000) / delta);
      frameCount = 0;
      last = now;
      
      // 根据 FPS 值改变文字颜色
      if (fps < 20) {
        fpsElement.classList.remove('text-green-400', 'text-yellow-400');
        fpsElement.classList.add('text-red-400');
      } else if (fps < 45) {
        fpsElement.classList.remove('text-green-400', 'text-red-400');
        fpsElement.classList.add('text-yellow-400');
      } else {
        fpsElement.classList.remove('text-yellow-400', 'text-red-400');
        fpsElement.classList.add('text-green-400');
      }
    }

    // 更新显示文本
    fpsElement.textContent = `FPS: ${fps}`;
    
    // 继续更新
    requestAnimationFrame(update);
  }

  // 启动 FPS 更新
  if (requestAnimationFrame) {
    requestAnimationFrame(update);
  } else {
    console.warn('requestAnimationFrame 不支持');
  }
  
  // ===== 自动隐藏功能 =====
  let hideTimeout;
  
  // 重置隐藏计时器
  const resetHideTimeout = () => {
    clearTimeout(hideTimeout);
    fpsElement.style.opacity = '0.7';
    
    // 5秒无交互后降低透明度
    hideTimeout = setTimeout(() => {
      fpsElement.style.opacity = '0.3';
    }, 5000);
  };
  
  // 初始化并添加事件监听
  resetHideTimeout();
  document.addEventListener('mousemove', resetHideTimeout);
  document.addEventListener('touchstart', resetHideTimeout);
}

// ===== 禁止右键菜单功能 =====
function MenuExt() {
  document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  });
}

// ===== 配置加载完成后执行 =====
window.addEventListener('configLoaded', function() {
  // 根据调试配置启用功能
  if (window.debugConfig?.showFps) {
    initFPS();
  }
  
  if (window.debugConfig?.menuExt) {
    MenuExt();
  }
});