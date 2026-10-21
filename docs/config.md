# 📁 配置文件说明 (config.json)

## 🛠 调试设置 (Debug)
- **showFPS**  
  `boolean` | 是否开启屏幕帧率(FPS)显示  
  *示例: `true` 或 `false`*
- **menuExt**  
  `boolean` | 是否禁止右键菜单  
  *示例: `true` 或 `false`*

## 👤 个人资料 (Profile)
- **name**  
  `string` | 个人昵称/用户名，支持html代码  
  *示例: "```Hello, I'm <span class=\"text-gradient\">nuoxian</span>```"*
- **title**  
  `string` | 网站标题  
  *示例: "Hi, I'm nuoxian"*
- **description**  
  `string` | 个人简介描述  
  *示例: "Hi, Welcome to nuoxian's HomePage 👋"*

## 🌐 社交链接 (Social)
```yaml
- name:        "按钮显示文本"  # 如：GitHub
  iconOnly:    true/false     # 只显示图标，不显示文字（省略时为 false）
  iconify:     "图标代码"      # Iconify图标库标识符
  url:         "https://"     # 点击跳转链接
  hoverBg:     "渐变颜色"      # 悬停背景色，支持CSS渐变、
```

## 📁 项目展示 (Projects)
- **projectsName**  
  `string` | 项目名称  
  *示例: "💻Projects"*
- **projectsUrl**  
  `string` | 项目跳转链接  
  *示例: "https://nuoxiana.cn"*
```yaml
- title:       "项目名称"      # 项目名称
  description: "项目描述"      # 项目描述
  url:         "项目链接"      # 点击跳转链接
  iconify:     "项目图标"      # Iconify图标库标识符
```

> 图标建议优先用 `flat-color-icons`（本项目已内置该图标集）。
> 每多用一个图标集，页面就多一次 Iconify 请求。

## 🎖️ 技能展示 (skill)
- **skillName**  
  `string` | 技能名称  
  *示例: "⚡Skills"*
- **skillUrl**  
  `string` | 技能图地址，按屏宽自动切换三档  
  *默认（本地文件，无需外网）:* `"static/img/skills-15.svg"`  
  文件名里的 `15` 会被忽略，窄屏自动换成 `skills-12.svg`（<1024px）、`skills-8.svg`（<640px）。  
  *也兼容 skillicons.dev 在线地址:*
  `"https://skillicons.dev/icons?perline=15&i=apple,docker,git"`  
  （`perline` 参数同样会被按屏宽改写）

> 想改技能列表：用 [skillicons.dev](https://skillicons.dev) 生成新链接，把 `i=` 后面的图标名换成新的，
> 分别以 `perline=15 / 12 / 8` 下载三张图，覆盖 `static/img/skills-15.svg`、`skills-12.svg`、`skills-8.svg`，
> 再把 `skillUrl` 写回 `"static/img/skills-15.svg"` 即可。这样页面不依赖第三方站点。


## 📊 贪吃蛇贡献图 (githubSnake)
- **githubSnake**  
  `string | object` | 使用 github.com/Platane/snk 的贡献图生成代码  
  *字符串示例（单一URL，深浅色复用）:*  
  `"https://raw.gitmirror.com/nuoxi4n/nuoxi4n/main/assets/github-contribution-grid-snake-dark.svg"`  
  *对象示例（分别指定深色/浅色 URL）:*
  ```json
  "githubSnake": {
    "dark": "https://raw.gitmirror.com/nuoxi4n/nuoxi4n/main/assets/github-contribution-grid-snake-dark.svg",
    "light": "https://raw.gitmirror.com/nuoxi4n/nuoxi4n/main/assets/github-contribution-grid-snake.svg"
  }
  ```
  *说明: 对象形式下，主题切换时自动替换对应URL；字符串形式向后兼容。*

## ©️ 底部版权 (footer)
- **footer**  
  `string` | HTML 字符串，可以使用html代码  
  *示例: "```<p>© 2020 <a href=\"https://nuoxiana.cn\">nuoxian</a>.```"*

## 🎵 音乐设置 (music)
- **enabled**  
  `boolean` | 是否启用音乐播放器  
  *示例: `true` 或 `false`*
- **server**  
  `string` | 音乐平台  
  *示例: netease、tencent、kugou、xiami、baidu*
- **type**  
  `string` | 音乐类型  
  *示例: song，playlist，album，search，artist*
- **id**  
  `int` | 音乐id  
  *示例: 歌曲 id / 列表 id / 专辑 id / 搜索关键词*
- **fixed**  
  `boolean` | 固定模式  
  *示例: `true` 或 `false`*
- **mini**  
  `boolean` | 迷你模式  
  *示例: `true` 或 `false`*
- **theme**  
  `string` | 播放器主色调  
  *示例: "#2980b9"*

以下为高级项，`config.json` 中已显式写出并给出合理默认值，绝大多数情况不用改动：

| 键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `autoplay` | `boolean` | `false` | 自动播放（浏览器通常会拦截） |
| `loop` | `string` | `'all'` | `all` / `one` / `none` |
| `order` | `string` | `'list'` | `list` / `random` |
| `preload` | `string` | `'auto'` | `none` / `metadata` / `auto` |
| `volume` | `number` | `0.7` | 0.1～1.0，步进 0.1；播放器会记住用户手动调过的音量 |
| `mutex` | `boolean` | `true` | 同时只允许一个播放器发声 |
| `lrcEnabled` | `boolean` | `false` | 是否显示歌词 |
| `listFolded` | `boolean` | `false` | 列表是否默认折叠 |
| `listMaxHeight` | `string` | `'340px'` | 列表最大高度 |
| `storageName` | `string` | `'metingjs'` | localStorage 键名 |
| `api` | `string` | 见下 | 自建 Meting API 地址模板 |

> **关于 `api`**：不写就用内置的自托管地址，想换服务可以写在根目录
> `scripts.js` 里（`var meting_api = '...'`），或者只给这一个站点单独写在这里。
> 注意模板里 `:server`、`:type`、`:id`、`:auth` 是 MetingJS 的占位符，**不要改成别的写法**。


## 📅 特殊日期 (specialDates)
- **enableSpecialDates**  
  `boolean` | 是否启用特殊日期（省略时视为启用；要关掉整组节日就设为 `false`）  
  *示例: `true` 或 `false`*

节日用**预设**写法：只写日期、文案和一个主色，成段的 CSS 由程序生成，所以不会出现「节日样式各不相同、改一次要改十遍」的情况。

```jsonc
// 单日节日
{ "m": 1, "d": 1, "emoji": "🎉", "text": "元旦快乐！", "colors": ["#ff0000", "#ff7b00", "#ffd000"], "effect": "sparkle", "weight": 800 }

// 日期范围（含首含尾）
{ "from": "10-1", "to": "10-7", "emoji": "🇨🇳", "text": "国庆节快乐！", "colors": ["#de2910", "#ffde00"], "effect": "glow" }

// 全局灰度（公祭日这类）
{ "m": 9, "d": 18, "emoji": "🕯️", "text": "铭记历史，勿忘国耻！", "effect": "memorial" }
```

| 键 | 必填 | 说明 |
| --- | --- | --- |
| `m` / `d` | 单日必填 | 月 / 日，如 `1` / `1` |
| `from` / `to` | 范围必填 | `"月-日"` 字符串，如 `"10-1"` / `"10-7"`，两端都包含 |
| `emoji` | 否 | 会包进 `<span class='emoji'>`，自带不参与渐变的保护 |
| `text` | 是 | 替换个人简介的文案 |
| `colors` | 否 | 1～3 个十六进制色值；第一个色决定光晕颜色 |
| `effect` | 否 | `sparkle` / `pulse` / `wave` / `bounce` / `glow` / `shimmer` / `memorial` |
| `weight` | 否 | 字重，默认 `700`；`800` 时光晕自动加粗一档（8px → 10px） |
| `target` | 否 | 默认 `description`（只改简介）；`global` 时整页生效。`memorial` 固定为 `global` |

