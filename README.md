# tg-proxy
Telegram Bot API Proxy for Cloudflare Worker

一个轻量、安全的 Cloudflare Worker 代理，用于转发 Telegram Bot API 请求。通过 Token 白名单机制，确保只有你授权的机器人可以使用该代理，避免被他人滥用。

功能特点

· ✅ 零成本：Cloudflare Workers 免费计划每天 10 万次请求，个人使用完全足够
· ✅ 多机器人支持：通过环境变量配置多个 Bot Token，用逗号分隔即可
· ✅ Token 白名单校验：只有路径中包含允许的 Token 才会被代理，拒绝其他所有请求
· ✅ 错误处理：对网络错误返回明确的 502 状态码，便于排查
· ✅ 自定义域名：推荐绑定自己的域名，避免 workers.dev 域名在国内的不稳定

部署步骤

1. 创建 Cloudflare Worker

· 登录 Cloudflare 控制台
· 进入 Workers 和 Pages → 创建应用程序 → 创建 Worker
· 给 Worker 命名（例如 tg-proxy）
· 点击 编辑代码，将本仓库的 worker.js 内容完整粘贴进去
· 点击 保存并部署

2. 配置环境变量（必填）

在 Worker 详情页 → 设置 → 变量 → 环境变量 → 添加变量

变量名 值示例 说明
ALLOWED_TOKENS 1234567890:ABCdefGhIJK,0987654321:XYZuvwRSTUV 允许的 Bot Token 列表，多个用英文逗号分隔，不要有空格

添加后点击 保存，然后 重新部署 使变量生效。

3. （推荐）绑定自定义域名

· 在 Worker 页面 → 触发器 → 自定义域 → 设置自定义域
· 输入你拥有的子域名（如 tg.example.com），按提示添加 CNAME 记录
· 之后可以通过 https://tg.example.com 访问代理

如果不绑定自定义域名，也可以使用 Cloudflare 提供的 https://你的子域名.workers.dev，但国内部分地区可能访问不稳定。

如何使用

API 调用格式

所有请求必须遵循以下格式：

```
https://你的代理域名/bot<完整Token>/<方法名>
```

示例：获取机器人基本信息

```
https://tg.example.com/bot1234567890:ABCdefGhIJK/getMe
```

如果返回 {"ok":true,...} 的 JSON，说明代理工作正常。

在你的 Bot 应用中配置

将原本请求 Telegram 官方 API 的地址：

```
https://api.telegram.org/bot<token>/<method>
```

替换为你的代理地址：

```
https://你的代理域名/bot<token>/<method>
```

注意：路径中必须保留 /bot<token>/ 这一部分，不能省略。

安全提醒

· ⚠️ 不要泄露你的 Bot Token：任何人拿到 Token 都可以通过你的代理控制你的机器人
· ⚠️ Cloudflare 账号风险：将 Workers 用作代理可能违反 Cloudflare 服务条款，已有账号因此被封的案例。建议仅用于个人低流量测试，生产环境请考虑自建 VPS + Nginx 方案
· ⚠️ IP 被限可能：Cloudflare Workers 使用共享 IP 池，Telegram 可能对此类代理进行速率限制，遇到频繁失败时请更换方案

常见问题

Q：多个 Token 如何配置？
A：在环境变量 ALLOWED_TOKENS 中用英文逗号分隔，例如 token1,token2,token3，不要有空格。

Q：为什么我访问返回 403 Forbidden？
A：可能原因：

· 环境变量 ALLOWED_TOKENS 未设置或值为空
· 请求路径中的 Token 不在白名单内
· 路径格式错误，不是以 /bot<token>/ 开头

Q：如何测试代理是否正常工作？
A：在浏览器访问 https://你的代理域名/bot<你的Token>/getMe，如果看到 {"ok":true,...} 即为成功。

许可证

MIT License

致谢

基于 Cloudflare Workers 构建，感谢 Cloudflare 提供的免费计算资源。
