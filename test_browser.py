import asyncio
import sys
from playwright.async_api import async_playwright

async def run_test():
    print("Attempting to initialize playwright in diagnostic mode...")
    try:
        if sys.platform == 'win32':
             # Apply policy just like we did in main
             asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
             print("Applied ProactorEventLoopPolicy.")
             
        playwright = await async_playwright().start()
        print("Playwright started successfully.")
        
        print("Launching browser...")
        browser = await playwright.chromium.launch(headless=True)
        print("Browser launched successfully.")
        
        page = await browser.new_page()
        print("New page created.")
        
        url = "https://www.google.com"
        print(f"Navigating to {url}...")
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        print(f"Navigation successful. Title: {await page.title()}")
        
        await browser.close()
        await playwright.stop()
        print("\n✅ DIAGNOSTIC PASSED: Browser engine is healthy.")
    except Exception as e:
        print(f"\n❌ DIAGNOSTIC FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_test())
