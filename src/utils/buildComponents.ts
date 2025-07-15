import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import type { ComponentMetadata } from '../types/component';

interface PaginatedOutput {
	items: ComponentMetadata[];
	page: number;
	hasNextPage: boolean;
}

interface BuildOutput {
	blocks: ComponentMetadata[];
	templates: ComponentMetadata[];
}

export function buildComponents() {
	const distPath = join(process.cwd(), 'dist');
	const contentsPath = join(process.cwd(), 'contents');
	const ITEMS_PER_PAGE = 10;

	// Create dist directory if it doesn't exist
	if (!existsSync(distPath)) {
		mkdirSync(distPath, { recursive: true });
	}

	// Create blocks and templates directories
	mkdirSync(join(distPath, 'blocks'), { recursive: true });
	mkdirSync(join(distPath, 'templates'), { recursive: true });

	const output: BuildOutput = {
		blocks: [],
		templates: []
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

						// Add to output array
						output[type as keyof BuildOutput].push(metadata);

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

	// Helper function to create paginated files
	function createPaginatedFiles(items: ComponentMetadata[], type: string) {
		const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
		
		for (let page = 1; page <= totalPages; page++) {
			const startIndex = (page - 1) * ITEMS_PER_PAGE;
			const endIndex = startIndex + ITEMS_PER_PAGE;
			const pageItems = items.slice(startIndex, endIndex);
			
			const paginatedData: PaginatedOutput = {
				items: pageItems,
				page: page,
				hasNextPage: page < totalPages
			};

			writeFileSync(
				join(distPath, `${type}-${page}.json`),
				JSON.stringify(paginatedData, null, 2)
			);
		}

		return totalPages;
	}

	// Create paginated files for blocks and templates
	const blockPages = createPaginatedFiles(output.blocks, 'blocks');
	const templatePages = createPaginatedFiles(output.templates, 'templates');

	console.log('\n🎉 Build complete!');
	console.log(`📁 Generated files in dist/`);
	console.log(
		`📄 blocks: ${output.blocks.length} components across ${blockPages} pages`
	);
	console.log(
		`📄 templates: ${output.templates.length} components across ${templatePages} pages`
	);

	return output;
}

// If this file is run directly
if (import.meta.main) {
	buildComponents();
}
