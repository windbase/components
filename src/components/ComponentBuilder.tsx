import { Code, Copy, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComponents } from '../hooks/useComponents';
import type { Component } from '../types/component';
import { ComponentForm } from './ComponentForm';

export function ComponentBuilder() {
	const {
		components,
		paginationData,
		loadComponents,
		createComponent,
		updateComponent,
		deleteComponent
	} = useComponents();
	const navigate = useNavigate();
	const [formOpen, setFormOpen] = useState(false);
	const [editingComponent, setEditingComponent] = useState<Component | null>(
		null
	);
	const [activeTab, setActiveTab] = useState('blocks');

	const handleCreateComponent = () => {
		setEditingComponent(null);
		setFormOpen(true);
	};

	const handleEditComponent = (component: Component) => {
		setEditingComponent(component);
		setFormOpen(true);
	};

	const handleOpenEditor = (component: Component) => {
		navigate(`/edit/${component.type}/${component.metadata.id}`);
	};

	const handleFormSubmit = async (data: Component) => {
		if (editingComponent) {
			// Check if the name/ID has changed
			const nameChanged = editingComponent.metadata.id !== data.metadata.id;
			await updateComponent(editingComponent.metadata.id, data, nameChanged);
			// Reload components to reflect changes
			loadComponents(paginationData.currentPage, 12, activeTab);
		} else {
			const success = await createComponent(data);
			if (success) {
				// Redirect to the editor page
				navigate(`/edit/${data.type}/${data.metadata.id}`);
			}
		}
		setFormOpen(false);
	};

	const handleDeleteComponent = async (id: string) => {
		if (confirm('Are you sure you want to delete this component?')) {
			await deleteComponent(id);
			// Reload components to reflect changes
			loadComponents(paginationData.currentPage, 12, activeTab);
		}
	};

	const handlePreview = (html: string) => {
		const newWindow = window.open('', '_blank');
		if (newWindow) {
			newWindow.document.writeln(`
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

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		// Reset pagination when switching tabs and load components for new type
		loadComponents(1, 12, value);
	};

	const handlePageChange = (page: number) => {
		loadComponents(page, 12, activeTab);
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Windbase Components
						</h1>
						<p className="text-muted-foreground mt-1">
							Create and manage beautiful TailwindCSS components
						</p>
					</div>
					<Button
						onClick={handleCreateComponent}
						className="flex items-center gap-2"
					>
						<Plus className="w-4 h-4" />
						New Component
					</Button>
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="blocks">Blocks</TabsTrigger>
					<TabsTrigger value="templates">Templates</TabsTrigger>
				</TabsList>

				<TabsContent value="blocks" className="mt-6">
					<ComponentGrid
						components={components}
						onEdit={handleEditComponent}
						onOpenEditor={handleOpenEditor}
						onDelete={handleDeleteComponent}
						onPreview={handlePreview}
						onCopyCode={handleCopyCode}
					/>
					<Pagination
						currentPage={paginationData.currentPage}
						totalPages={paginationData.totalPages}
						onPageChange={handlePageChange}
					/>
				</TabsContent>

				<TabsContent value="templates" className="mt-6">
					<ComponentGrid
						components={components}
						onEdit={handleEditComponent}
						onOpenEditor={handleOpenEditor}
						onDelete={handleDeleteComponent}
						onPreview={handlePreview}
						onCopyCode={handleCopyCode}
					/>
					<Pagination
						currentPage={paginationData.currentPage}
						totalPages={paginationData.totalPages}
						onPageChange={handlePageChange}
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
	onOpenEditor: (component: Component) => void;
	onDelete: (id: string) => void;
	onPreview: (html: string) => void;
	onCopyCode: (html: string) => void;
}

function ComponentGrid({
	components,
	onEdit,
	onOpenEditor,
	onDelete,
	onPreview,
	onCopyCode
}: ComponentGridProps) {
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
					onOpenEditor={() => onOpenEditor(component)}
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
	onOpenEditor: () => void;
	onDelete: () => void;
	onPreview: () => void;
	onCopyCode: () => void;
}

function ComponentCard({
	component,
	onEdit,
	onOpenEditor,
	onDelete,
	onPreview,
	onCopyCode
}: ComponentCardProps) {
	return (
		<Card className="group relative overflow-hidden transition-all">
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
							onClick={onOpenEditor}
							className="h-8 w-8"
						>
							<Code className="w-4 h-4" />
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
