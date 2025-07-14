import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import type { ComponentMetadata } from '../types/component';

interface BuildOutput {
	blocks: { [key: string]: ComponentMetadata };
	templates: { [key: string]: ComponentMetadata };
}

export function buildComponents() {
	const distPath = join(process.cwd(), 'dist');
	const contentsPath = join(process.cwd(), 'contents');

	// Create dist directory if it doesn't exist
	if (!existsSync(distPath)) {
		mkdirSync(distPath, { recursive: true });
	}

	// Create blocks and templates directories
	mkdirSync(join(distPath, 'blocks'), { recursive: true });
	mkdirSync(join(distPath, 'templates'), { recursive: true });

	const output: BuildOutput = {
		blocks: {},
		templates: {}
	};

	// Process blocks and templates
	['blocks', 'templates'].forEach((type) => {
		const typePath = join(contentsPath, type);

		if (existsSync(typePath)) {
			const components = readdirSync(typePath, { withFileTypes: true })
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => dirent.name);

			components.forEach((componentName) => {
				const componentPath = join(typePath, componentName);
				const metadataPath = join(componentPath, 'metadata.json');
				const htmlPath = join(componentPath, 'index.html');

				if (existsSync(metadataPath) && existsSync(htmlPath)) {
					try {
						const metadata: ComponentMetadata = JSON.parse(
							readFileSync(metadataPath, 'utf-8')
						);
						const html = readFileSync(htmlPath, 'utf-8');

						// Add to output
						output[type as keyof BuildOutput][metadata.id] = metadata;

						// Write HTML file to dist
						writeFileSync(join(distPath, type, `${metadata.id}.html`), html);

						console.log(`✓ Built ${type}/${metadata.id}`);
					} catch (error) {
						console.error(`✗ Error building ${type}/${componentName}:`, error);
					}
				}
			});
		}
	});

	// Write metadata files
	writeFileSync(
		join(distPath, 'blocks.json'),
		JSON.stringify(output.blocks, null, 2)
	);

	writeFileSync(
		join(distPath, 'templates.json'),
		JSON.stringify(output.templates, null, 2)
	);

	console.log('\n🎉 Build complete!');
	console.log(`📁 Generated files in dist/`);
	console.log(
		`📄 blocks.json (${Object.keys(output.blocks).length} components)`
	);
	console.log(
		`📄 templates.json (${Object.keys(output.templates).length} components)`
	);

	return output;
}

// If this file is run directly
if (import.meta.main) {
	buildComponents();
}
