const ALLOWED_TOKENS_ENV = "ALLOWED_TOKENS";

function isAllowedPath(path, env) {
    const allowedTokensStr = env[ALLOWED_TOKENS_ENV] || "";
    if (allowedTokensStr === "") return false;

    const tokens = allowedTokensStr.split(",").map(t => t.trim());
    const allowedTokensSet = new Set(tokens.filter(Boolean));

    const match = path.match(/^\/bot([^/]+)/);
    if (!match) return false;
    const tokenInPath = match[1];
    return allowedTokensSet.has(tokenInPath);
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (!isAllowedPath(url.pathname, env)) {
            return new Response('Forbidden: Invalid or missing Bot Token', { status: 403 });
        }

        url.host = "api.telegram.org";
        const proxyRequest = new Request(url, {
            method: request.method,
            headers: request.headers,
            body: request.body
        });

        try {
            return await fetch(proxyRequest);
        } catch (error) {
            return new Response(`Proxy error: ${error.message}`, { status: 502 });
        }
    }
};
