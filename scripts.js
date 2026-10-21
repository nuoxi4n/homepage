// ============================================================
// 自定义脚本
// ============================================================
// 这个文件是留给你自己的：想加什么脚本都写在这里。
// 它最后加载（defer，在 config-loader.js / script.js 之后），
// 所以下面这些都已经可用：
//
//   Homepage.config              原始配置对象
//   Homepage.get('profile.name') 按路径取配置值
//   Homepage.onConfigLoaded(fn)  配置就绪后执行（已经就绪就立刻执行）
//   window.meting_api            音乐 API 地址（不写就用 config-loader.js 里的默认值）
//
// 也可以不用 Homepage，直接监听事件：
//   window.addEventListener('configLoaded', () => { ... });
//
// 这个文件删掉页面照样能跑。
// ============================================================

// —— 例：配置就绪后打个招呼 ——
// Homepage.onConfigLoaded(function (config) {
//   console.log('配置已加载', Homepage.get('profile.name'));
// });

// —— 例：换一个 Meting API 服务 ——
// var meting_api = 'https://你的域名/meting/?server=:server&type=:type&id=:id&auth=:auth&r=:r';
// 注意 :server / :type / :id / :auth 是 MetingJS 的占位符，不要改写法。
// 只有一个站点要换服务的话，写在 config.json 的 music.api 里更合适。
