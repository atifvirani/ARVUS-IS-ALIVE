import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Playwright is optional — gracefully handle if not installed
try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logger.warning("Playwright not installed. Browser tool will be unavailable. Install with: pip install playwright && playwright install chromium")


class BrowserTool:
    """Playwright-based browser tool for autonomous web intelligence."""

    def __init__(self):
        self._browser = None
        self._playwright = None

    @property
    def schema(self) -> Dict[str, Any]:
        return {
            "name": "browser",
            "description": "Browse the web, search Google, scrape content, and take screenshots. Actions: 'navigate' (open URL and return text), 'search' (Google search), 'scrape' (extract page content), 'screenshot' (capture page as base64 image).",
            "parameters": {
                "action": "One of: 'navigate', 'search', 'scrape', 'screenshot'",
                "url": "The URL to navigate to (required for 'navigate', 'scrape', 'screenshot')",
                "query": "The search query (required for 'search')"
            }
        }

    async def _ensure_browser(self):
        """Lazily initialize browser on first use."""
        if not PLAYWRIGHT_AVAILABLE:
            raise RuntimeError("Playwright is not installed. Run: pip install playwright && playwright install chromium")

        if self._browser is None:
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            logger.info("Browser initialized (headless Chromium)")

    async def execute(self, params: Dict[str, Any]) -> str:
        action = params.get("action", "")
        
        if not action:
            return "Error: 'action' parameter is required. Must be one of: navigate, search, scrape, screenshot"
        
        try:
            await self._ensure_browser()

            if action == "navigate":
                return await self._navigate(params)
            elif action == "search":
                return await self._search(params)
            elif action == "scrape":
                return await self._scrape(params)
            elif action == "screenshot":
                return await self._screenshot(params)
            else:
                return f"Error: Unknown action '{action}'. Must be one of: navigate, search, scrape, screenshot"
        except RuntimeError as e:
            return f"Error: {str(e)}"
        except Exception as e:
            logger.error(f"Browser tool error: {e}", exc_info=True)
            return f"Error executing browser action: {str(e)}"

    async def _navigate(self, params: Dict[str, Any]) -> str:
        url = params.get("url", "")
        if not url:
            return "Error: 'url' parameter is required for navigate action."

        page = await self._browser.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            title = await page.title()
            # Extract visible text content
            text_content = await page.evaluate("() => document.body.innerText")
            # Truncate to prevent overwhelming the LLM context
            if len(text_content) > 4000:
                text_content = text_content[:4000] + "\n... [Content truncated]"
            return f"Page Title: {title}\nURL: {url}\n\nContent:\n{text_content}"
        finally:
            await page.close()

    async def _search(self, params: Dict[str, Any]) -> str:
        query = params.get("query", "")
        if not query:
            return "Error: 'query' parameter is required for search action."

        page = await self._browser.new_page()
        try:
            search_url = f"https://www.google.com/search?q={query}"
            await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)

            # Extract search results
            results = await page.evaluate("""
                () => {
                    const items = document.querySelectorAll('.g');
                    const results = [];
                    items.forEach((item, i) => {
                        if (i >= 5) return;
                        const title = item.querySelector('h3')?.innerText || '';
                        const link = item.querySelector('a')?.href || '';
                        const snippet = item.querySelector('.VwiC3b')?.innerText || '';
                        if (title) results.push({ title, link, snippet });
                    });
                    return results;
                }
            """)

            if not results:
                return f"No search results found for: {query}"

            output = f"Google Search Results for: {query}\n\n"
            for i, r in enumerate(results, 1):
                output += f"{i}. {r.get('title', 'No title')}\n"
                output += f"   URL: {r.get('link', 'No link')}\n"
                output += f"   {r.get('snippet', 'No snippet')}\n\n"

            return output
        finally:
            await page.close()

    async def _scrape(self, params: Dict[str, Any]) -> str:
        url = params.get("url", "")
        if not url:
            return "Error: 'url' parameter is required for scrape action."

        page = await self._browser.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            title = await page.title()

            # Extract structured content
            content = await page.evaluate("""
                () => {
                    const data = {
                        title: document.title,
                        headings: [],
                        paragraphs: [],
                        links: [],
                    };
                    
                    document.querySelectorAll('h1, h2, h3').forEach(h => {
                        data.headings.push({ tag: h.tagName, text: h.innerText.trim() });
                    });
                    
                    document.querySelectorAll('p').forEach((p, i) => {
                        if (i < 20 && p.innerText.trim()) {
                            data.paragraphs.push(p.innerText.trim());
                        }
                    });
                    
                    document.querySelectorAll('a').forEach((a, i) => {
                        if (i < 15 && a.href && a.innerText.trim()) {
                            data.links.push({ text: a.innerText.trim(), href: a.href });
                        }
                    });
                    
                    return data;
                }
            """)

            output = f"Scraped: {title}\nURL: {url}\n\n"

            if content.get('headings'):
                output += "Headings:\n"
                for h in content['headings']:
                    output += f"  [{h['tag']}] {h['text']}\n"
                output += "\n"

            if content.get('paragraphs'):
                output += "Content:\n"
                for p in content['paragraphs']:
                    output += f"  {p[:300]}\n\n"

            if content.get('links'):
                output += "Links:\n"
                for link in content['links'][:10]:
                    output += f"  - {link['text']}: {link['href']}\n"

            return output
        finally:
            await page.close()

    async def _screenshot(self, params: Dict[str, Any]) -> str:
        url = params.get("url", "")
        if not url:
            return "Error: 'url' parameter is required for screenshot action."

        page = await self._browser.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            title = await page.title()

            # Save screenshot
            import base64
            screenshot_bytes = await page.screenshot(full_page=False)
            b64 = base64.b64encode(screenshot_bytes).decode('utf-8')

            return f"Screenshot captured for: {title} ({url})\nBase64 length: {len(b64)} characters\n[Screenshot data available]"
        finally:
            await page.close()

    async def cleanup(self):
        """Cleanup browser resources."""
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
