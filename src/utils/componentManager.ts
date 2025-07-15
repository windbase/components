import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import type { Component, ComponentMetadata } from '../types/component';

const CONTENTS_PATH = join(process.cwd(), 'contents');

export class ComponentManager {
	private getComponentPath(type: string, folder: string): string {
		return join(CONTENTS_PATH, type, folder);
	}

	private getMetadataPath(type: string, folder: string): string {
		return join(this.getComponentPath(type, folder), 'metadata.json');
	}

	private getHtmlPath(type: string, folder: string): string {
		return join(this.getComponentPath(type, folder), 'index.html');
	}

	private getPreviewPath(type: string, folder: string): string {
		return join(this.getComponentPath(type, folder), 'preview.png');
	}

	private saveScreenshot(type: string, folder: string, screenshotData: string): void {
		try {
			// Convert base64 data URL to buffer
			const base64Data = screenshotData.replace(/^data:image\/png;base64,/, '');
			const buffer = Buffer.from(base64Data, 'base64');
			
			// Write the buffer to preview.png
			writeFileSync(this.getPreviewPath(type, folder), buffer);
		} catch (error) {
			console.error('Error saving screenshot:', error);
		}
	}

	async loadComponents(
		page: number = 1,
		limit: number = 12,
		type: string = 'all'
	): Promise<{
		data: Component[];
		currentPage: number;
		totalPages: number;
		totalItems: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	}> {
		const allComponents: Component[] = [];

		try {
			// Ensure contents directory exists
			if (!existsSync(CONTENTS_PATH)) {
				mkdirSync(CONTENTS_PATH, { recursive: true });
			}

			const typesToProcess = type === 'all' ? ['blocks', 'templates'] : [type];

			// Process blocks and templates
			for (const componentType of typesToProcess) {
				const typePath = join(CONTENTS_PATH, componentType);

				if (!existsSync(typePath)) {
					mkdirSync(typePath, { recursive: true });
					continue;
				}

				const folders = readdirSync(typePath, { withFileTypes: true })
					.filter((dirent) => dirent.isDirectory())
					.map((dirent) => dirent.name);

				for (const folder of folders) {
					const metadataPath = this.getMetadataPath(componentType, folder);
					const htmlPath = this.getHtmlPath(componentType, folder);

					if (existsSync(metadataPath) && existsSync(htmlPath)) {
						try {
							const metadata: ComponentMetadata = JSON.parse(
								readFileSync(metadataPath, 'utf-8')
							);
							const html = readFileSync(htmlPath, 'utf-8');

							allComponents.push({
								metadata,
								html,
								type: componentType as 'blocks' | 'templates',
								folder
							});
						} catch (error) {
							console.error(
								`Error loading component ${componentType}/${folder}:`,
								error
							);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error loading components:', error);
		}

		// Apply pagination
		const totalItems = allComponents.length;
		const totalPages = Math.ceil(totalItems / limit);
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedComponents = allComponents.slice(startIndex, endIndex);

		return {
			data: paginatedComponents,
			currentPage: page,
			totalPages,
			totalItems,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1
		};
	}

	// Keep original method for backward compatibility
	async loadAllComponents(): Promise<Component[]> {
		const result = await this.loadComponents(1, 1000, 'all');
		return result.data;
	}

	async createComponent(component: Component, screenshotData: string | null = null): Promise<boolean> {
		try {
			const componentPath = this.getComponentPath(
				component.type,
				component.folder
			);

			// Create component directory
			mkdirSync(componentPath, { recursive: true });

			// Write metadata file
			writeFileSync(
				this.getMetadataPath(component.type, component.folder),
				JSON.stringify(component.metadata, null, 2)
			);

			// Write HTML file
			writeFileSync(
				this.getHtmlPath(component.type, component.folder),
				component.html
			);

			// Write preview image if provided
			if (screenshotData) {
				this.saveScreenshot(component.type, component.folder, screenshotData);
			}

			return true;
		} catch (error) {
			console.error('Error creating component:', error);
			return false;
		}
	}

	async updateComponent(
		originalId: string,
		component: Component,
		nameChanged: boolean = false,
		screenshotData: string | null = null
	): Promise<boolean> {
		try {
			// Find the original component to get its current location
			const allComponents = await this.loadAllComponents();
			const originalComponent = allComponents.find(
				(c) => c.metadata.id === originalId
			);

			if (!originalComponent) {
				console.error('Original component not found');
				return false;
			}

			if (nameChanged) {
				// Remove old component folder
				const oldComponentPath = this.getComponentPath(
					originalComponent.type,
					originalComponent.folder
				);
				if (existsSync(oldComponentPath)) {
					rmSync(oldComponentPath, { recursive: true });
				}

				// Create new component (like creating a new one)
				return this.createComponent(component, screenshotData);
			} else {
				// Update existing component in place
				this.getComponentPath(component.type, component.folder);

				// Update metadata file
				writeFileSync(
					this.getMetadataPath(component.type, component.folder),
					JSON.stringify(component.metadata, null, 2)
				);

				// Update HTML file
				writeFileSync(
					this.getHtmlPath(component.type, component.folder),
					component.html
				);

				// Update preview image if provided
				if (screenshotData) {
					this.saveScreenshot(component.type, component.folder, screenshotData);
				}

				return true;
			}
		} catch (error) {
			console.error('Error updating component:', error);
			return false;
		}
	}

	async deleteComponent(id: string): Promise<boolean> {
		try {
			const allComponents = await this.loadAllComponents();
			const component = allComponents.find((c) => c.metadata.id === id);

			if (!component) {
				console.error('Component not found');
				return false;
			}

			const componentPath = this.getComponentPath(
				component.type,
				component.folder
			);
			if (existsSync(componentPath)) {
				rmSync(componentPath, { recursive: true });
			}

			return true;
		} catch (error) {
			console.error('Error deleting component:', error);
			return false;
		}
	}
}

export const componentManager = new ComponentManager();
