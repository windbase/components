import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Copy, Code } from 'lucide-react';
import { useComponents } from '../hooks/useComponents';
import { ComponentForm } from './ComponentForm';
import type { Component } from '../types/component';

export function ComponentBuilder() {
  const { components, loading, createComponent, updateComponent, deleteComponent } = useComponents();
  const [formOpen, setFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [activeTab, setActiveTab] = useState('blocks');

  const handleCreateComponent = () => {
    setEditingComponent(null);
    setFormOpen(true);
  };

  const handleEditComponent = (component: Component) => {
    setEditingComponent(component);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Component) => {
    if (editingComponent) {
      // Check if the name/ID has changed
      const nameChanged = editingComponent.metadata.id !== data.metadata.id;
      await updateComponent(editingComponent.metadata.id, data, nameChanged);
    } else {
      await createComponent(data);
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      await deleteComponent(id);
    }
  };

  const handlePreview = (html: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Component Preview</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleCopyCode = (html: string) => {
    navigator.clipboard.writeText(html);
    // You could add a toast notification here
  };

  const filteredComponents = components.filter(comp => comp.type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading components...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Windbase Components</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage beautiful TailwindCSS components
            </p>
          </div>
          <Button onClick={handleCreateComponent} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Component
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="mt-6">
          <ComponentGrid
            components={filteredComponents}
            onEdit={handleEditComponent}
            onDelete={handleDeleteComponent}
            onPreview={handlePreview}
            onCopyCode={handleCopyCode}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <ComponentGrid
            components={filteredComponents}
            onEdit={handleEditComponent}
            onDelete={handleDeleteComponent}
            onPreview={handlePreview}
            onCopyCode={handleCopyCode}
          />
        </TabsContent>
      </Tabs>

      <ComponentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingComponent={editingComponent}
      />
    </div>
  );
}

interface ComponentGridProps {
  components: Component[];
  onEdit: (component: Component) => void;
  onDelete: (id: string) => void;
  onPreview: (html: string) => void;
  onCopyCode: (html: string) => void;
}

function ComponentGrid({ components, onEdit, onDelete, onPreview, onCopyCode }: ComponentGridProps) {
  if (components.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          No components found. Create your first component to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {components.map((component) => (
        <ComponentCard
          key={component.metadata.id}
          component={component}
          onEdit={() => onEdit(component)}
          onDelete={() => onDelete(component.metadata.id)}
          onPreview={() => onPreview(component.html)}
          onCopyCode={() => onCopyCode(component.html)}
        />
      ))}
    </div>
  );
}

interface ComponentCardProps {
  component: Component;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onCopyCode: () => void;
}

function ComponentCard({ component, onEdit, onDelete, onPreview, onCopyCode }: ComponentCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{component.metadata.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              by {component.metadata.author}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreview}
              className="h-8 w-8"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopyCode}
              className="h-8 w-8"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {component.metadata.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="bg-muted/50 rounded-lg p-3 relative">
          <div className="absolute top-2 right-2">
            <Code className="w-4 h-4 text-muted-foreground" />
          </div>
          <pre className="text-xs text-muted-foreground overflow-hidden">
            <code className="line-clamp-3">
              {component.html.substring(0, 100)}...
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
} 