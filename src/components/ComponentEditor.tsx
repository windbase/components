import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import {
	ArrowLeft,
	ExternalLink,
	Maximize2,
	Minimize2,
	Monitor,
	Save,
	Smartphone,
	Tablet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComponents } from '../hooks/useComponents';
import type { Component } from '../types/component';

interface ComponentEditorProps {
	type: 'blocks' | 'templates';
}

export function ComponentEditor({ type }: ComponentEditorProps) {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { components, updateComponent } = useComponents();

	const [component, setComponent] = useState<Component | null>(null);
	const [htmlCode, setHtmlCode] = useState('');
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [previewDevice, setPreviewDevice] = useState<
		'desktop' | 'tablet' | 'mobile'
	>('desktop');
	const [isSaving, setIsSaving] = useState(false);
	const [isDarkMode] = useState(false);

	useEffect(() => {
		if (id && components.length > 0) {
			const foundComponent = components.find(
				(c) => c.metadata.id === id && c.type === type
			);
			if (foundComponent) {
				setComponent(foundComponent);
				setHtmlCode(foundComponent.html);
			}
		}
	}, [id, components, type]);

	const handleSave = async () => {
		if (!component) return;

		setIsSaving(true);
		try {
			const updatedComponent = { ...component, html: htmlCode };
			await updateComponent(component.metadata.id, updatedComponent);
			setComponent(updatedComponent);
		} catch (error) {
			console.error('Error saving component:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const handlePreviewInNewTab = () => {
		const newWindow = window.open('', '_blank');
		if (newWindow) {
			newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${component?.metadata.name} - Preview</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
            </style>
          </head>
          <body>
            ${htmlCode}
          </body>
        </html>
      `);
			newWindow.document.close();
		}
	};

	const getPreviewContainerClass = () => {
		switch (previewDevice) {
			case 'mobile':
				return 'max-w-sm mx-auto';
			case 'tablet':
				return 'max-w-2xl mx-auto';
			default:
				return 'w-full';
		}
	};

	if (!component) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-lg">Loading component...</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate('/')}
						className="shrink-0"
					>
						<ArrowLeft className="w-4 h-4" />
					</Button>
					<div>
						<h1 className="text-lg font-semibold">{component.metadata.name}</h1>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Badge variant="secondary">{component.type}</Badge>
							<span>by {component.metadata.author}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Device Preview Buttons */}
					<div className="flex items-center gap-1 mr-2">
						<Button
							variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
							size="icon"
							onClick={() => setPreviewDevice('desktop')}
						>
							<Monitor className="w-4 h-4" />
						</Button>
						<Button
							variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
							size="icon"
							onClick={() => setPreviewDevice('tablet')}
						>
							<Tablet className="w-4 h-4" />
						</Button>
						<Button
							variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
							size="icon"
							onClick={() => setPreviewDevice('mobile')}
						>
							<Smartphone className="w-4 h-4" />
						</Button>
					</div>

					<Button variant="ghost" size="icon" onClick={handlePreviewInNewTab}>
						<ExternalLink className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsFullscreen(!isFullscreen)}
					>
						{isFullscreen ? (
							<Minimize2 className="w-4 h-4" />
						) : (
							<Maximize2 className="w-4 h-4" />
						)}
					</Button>

					<Button
						onClick={handleSave}
						disabled={isSaving}
						className="flex items-center gap-2"
					>
						<Save className="w-4 h-4" />
						{isSaving ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</div>

			{/* Split Pane Editor */}
			<div className="flex h-[calc(100vh-73px)] p-2">
				<Tabs defaultValue="code" className="w-full">
					<TabsList>
						<TabsTrigger value="code">Code</TabsTrigger>
						<TabsTrigger value="preview">Preview</TabsTrigger>
					</TabsList>
					<TabsContent value="code">
						{/* Code Editor */}
						<div className="flex-1 overflow-auto">
							<CodeMirror
								value={htmlCode}
								onChange={(value) => setHtmlCode(value)}
								extensions={[html()]}
								theme={isDarkMode ? oneDark : undefined}
								basicSetup={{
									lineNumbers: true,
									foldGutter: true,
									dropCursor: false,
									allowMultipleSelections: false,
									indentOnInput: true,
									bracketMatching: true,
									closeBrackets: true,
									autocompletion: true,
									highlightSelectionMatches: false
								}}
								className="text-sm h-full"
							/>
						</div>

						{/* Live Preview */}
					</TabsContent>
					<TabsContent value="preview">
						<div className={`${getPreviewContainerClass()} h-full`}>
							<iframe
								srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
                      </style>
                    </head>
                    <body>
                      ${htmlCode}
                    </body>
                  </html>
                `}
								className="w-full h-full min-h-[400px] border border-gray-200 rounded-lg"
								title="Component Preview"
							/>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
