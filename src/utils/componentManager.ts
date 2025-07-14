import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
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

  async loadComponents(): Promise<Component[]> {
    const components: Component[] = [];
    
    try {
      // Ensure contents directory exists
      if (!existsSync(CONTENTS_PATH)) {
        mkdirSync(CONTENTS_PATH, { recursive: true });
      }

      // Process blocks and templates
      for (const type of ['blocks', 'templates']) {
        const typePath = join(CONTENTS_PATH, type);
        
        if (!existsSync(typePath)) {
          mkdirSync(typePath, { recursive: true });
          continue;
        }

        const folders = readdirSync(typePath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        for (const folder of folders) {
          const metadataPath = this.getMetadataPath(type, folder);
          const htmlPath = this.getHtmlPath(type, folder);

          if (existsSync(metadataPath) && existsSync(htmlPath)) {
            try {
              const metadata: ComponentMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
              const html = readFileSync(htmlPath, 'utf-8');

              components.push({
                metadata,
                html,
                type: type as 'blocks' | 'templates',
                folder,
              });
            } catch (error) {
              console.error(`Error loading component ${type}/${folder}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading components:', error);
    }

    return components;
  }

  async createComponent(component: Component): Promise<boolean> {
    try {
      const componentPath = this.getComponentPath(component.type, component.folder);
      
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
      
      return true;
    } catch (error) {
      console.error('Error creating component:', error);
      return false;
    }
  }

  async updateComponent(originalId: string, component: Component, nameChanged: boolean = false): Promise<boolean> {
    try {
      // Find the original component to get its current location
      const allComponents = await this.loadComponents();
      const originalComponent = allComponents.find(c => c.metadata.id === originalId);
      
      if (!originalComponent) {
        console.error('Original component not found');
        return false;
      }

      if (nameChanged) {
        // Remove old component folder
        const oldComponentPath = this.getComponentPath(originalComponent.type, originalComponent.folder);
        if (existsSync(oldComponentPath)) {
          rmSync(oldComponentPath, { recursive: true });
        }
        
        // Create new component (like creating a new one)
        return this.createComponent(component);
      } else {
        // Update existing component in place
        const componentPath = this.getComponentPath(component.type, component.folder);
        
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
        
        return true;
      }
    } catch (error) {
      console.error('Error updating component:', error);
      return false;
    }
  }

  async deleteComponent(id: string): Promise<boolean> {
    try {
      const allComponents = await this.loadComponents();
      const component = allComponents.find(c => c.metadata.id === id);
      
      if (!component) {
        console.error('Component not found');
        return false;
      }

      const componentPath = this.getComponentPath(component.type, component.folder);
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