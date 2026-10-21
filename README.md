# HomePages - HTML/CSS/JS

> 原项目作者[@ZYYO666](https://github.com/ZYYO666)，我([@nuoxi4n](https://github.com/nuoxi4n))在原版基础上对界面细节进行了二次优化，并规整了代码格式。

- 支持对音乐播放器进行管理。
- 支持添加自定义特殊日期并使用CSS样式。
- 支持对项目、昵称、介绍、底部Footer进行管理。
- 支持对社交按钮、Github贪吃蛇活跃图、技术栈进行管理。
- 首屏预加载：配置解析阶段即发起请求，内容就位前显示骨架屏，图片单独等待 settle。
- 支持深色 / 浅色 / 跟随系统三种主题。

最终效果：[https://nuoxiana.cn](https://nuoxiana.cn)

<img src="https://s2.loli.net/2025/09/02/xpZ42JemiFqK83k.png" width="600px">

## ⚙️ 部署使用

[配置文件说明 (config.json)](docs/config.md)

因为项目为纯静态页面，下载后起一个静态服务器打开根目录即可访问（见下方「本地预览」）。

- 服务器部署时 **不** 需要任何依赖环境😀。
- 通过 `config.json` 即可改变主页显示内容。

> **关于压缩**：静态托管平台（Cloudflare Pages / GitHub Pages / Vercel 等）会自动对
> `config.json`、CSS、JS 做 gzip / brotli 压缩，无需额外配置。
> 只有用 `python -m http.server` 这类不带压缩的简单服务器本地预览时，
> 才会看到未压缩的体积。

### 本地预览

```bash
python -m http.server 8099
```

然后浏览器打开 `http://127.0.0.1:8099`。**不要**直接双击 `index.html`：
`file://` 协议下 `fetch('config.json')` 会被跨域策略拦掉，页面只会停在骨架屏。

### Github Pages

通过Github提供的Github Pages项目即可在线部署一个网站

- 先 Fork 本项目
- 在 Settings 找到 Pages
- 部署一个静态网站
- 修改 config.json 配置内容

### CloudFlare Pages

通过CloudFlare提供的Pages项目即可在线部署一个网站

- 先 Fork 本项目
- 在CloudFlare中找到计算(Workers)
- 选择Workers 和 Pages并点击 创建
- 选择Pages导入存储库并链接Github账号
- 选择Fork的项目，命名HomePages创建和部署即可

## 🧠 技术栈

- HTML
- CSS
- JavaScript
- DeepSeek

## 📁 目录结构

```
Homepage/
├─ index.html              页面骨架 + 预加载脚本 + 骨架屏占位
├─ config.json             站点全部内容
├─ scripts.js              Meting API 地址模板（可换自托管）
├─ docs/
│  └─ config.md            配置字段说明
└─ static/
   ├─ css/index.css        主题变量、骨架屏、节日动画
   ├─ js/config-loader.js  配置渲染、主题、节日预设、图片 settle
   ├─ js/script.js         主题切换（三态）
   └─ img/skills-*.svg     本地化的技术栈图（三档 perline）
```

## 📃 License

This project is under [MIT](LICENSE) license.

## 🙏 Ref

- [TailwindCSS](https://v3.tailwindcss.com/)
- [iconify](https://iconify.design/)
- [skill-icons](https://github.com/tandpfun/skill-icons)
- [AplayerJS](https://aplayer.js.org/)
- [MetingJS](https://github.com/metowolf/MetingJS)
- [Generate Snake](https://github.com/Platane/snk)
