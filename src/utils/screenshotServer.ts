import { type Browser, chromium } from 'playwright';

/**
 * Generates a screenshot from HTML content using Playwright
 * @param htmlContent - The HTML content to capture
 * @returns Promise<Buffer> - The PNG image buffer
 */
export async function generateScreenshot(htmlContent: string): Promise<Buffer> {
	let browser: Browser | null = null;

	try {
		// Launch browser in headless mode
		browser = await chromium.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu'
			]
		});

		const page = await browser.newPage();

		// Create the full HTML document with TailwindCSS
		const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Component Preview</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, sans-serif;
              background-color: #ffffff;
              overflow: hidden;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

		// Set the HTML content
		await page.setContent(fullHtml, {
			waitUntil: 'networkidle',
			timeout: 30000
		});

		// Take screenshot
		const screenshot = await page.locator('body').screenshot({
			type: 'png'
		});

		return Buffer.from(screenshot);
	} catch (error) {
		console.error('Error generating screenshot:', error);
		throw error;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

/**
 * Generates a screenshot and returns it as a base64 data URL
 * @param htmlContent - The HTML content to capture
 * @returns Promise<string> - Base64 encoded PNG data URL
 */
export async function generateScreenshotDataURL(
	htmlContent: string
): Promise<string> {
	const buffer = await generateScreenshot(htmlContent);
	return `data:image/png;base64,${buffer.toString('base64')}`;
}
