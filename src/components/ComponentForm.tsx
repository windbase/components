import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultipleSelector, { type Option } from '@/components/ui/multiselect';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import type { Component } from '../types/component';

// Predefined tag options for components
const TAG_OPTIONS: Option[] = [
	{ value: 'header', label: 'Header' },
	{ value: 'hero', label: 'Hero' },
	{ value: 'navigation', label: 'Navigation' },
	{ value: 'footer', label: 'Footer' },
	{ value: 'sidebar', label: 'Sidebar' },
	{ value: 'card', label: 'Card' },
	{ value: 'button', label: 'Button' },
	{ value: 'form', label: 'Form' },
	{ value: 'input', label: 'Input' },
	{ value: 'modal', label: 'Modal' },
	{ value: 'dropdown', label: 'Dropdown' },
	{ value: 'table', label: 'Table' },
	{ value: 'list', label: 'List' },
	{ value: 'grid', label: 'Grid' },
	{ value: 'layout', label: 'Layout' },
	{ value: 'content', label: 'Content' },
	{ value: 'feature', label: 'Feature' },
	{ value: 'testimonial', label: 'Testimonial' },
	{ value: 'pricing', label: 'Pricing' },
	{ value: 'contact', label: 'Contact' },
	{ value: 'about', label: 'About' },
	{ value: 'gallery', label: 'Gallery' },
	{ value: 'blog', label: 'Blog' },
	{ value: 'ecommerce', label: 'E-commerce' },
	{ value: 'dashboard', label: 'Dashboard' },
	{ value: 'profile', label: 'Profile' },
	{ value: 'settings', label: 'Settings' },
	{ value: 'search', label: 'Search' },
	{ value: 'notification', label: 'Notification' },
	{ value: 'alert', label: 'Alert' },
	{ value: 'loading', label: 'Loading' },
	{ value: 'error', label: 'Error' },
	{ value: 'empty-state', label: 'Empty State' },
	{ value: 'call-to-action', label: 'Call to Action' },
	{ value: 'banner', label: 'Banner' },
	{ value: 'carousel', label: 'Carousel' },
	{ value: 'tabs', label: 'Tabs' },
	{ value: 'accordion', label: 'Accordion' },
	{ value: 'tooltip', label: 'Tooltip' },
	{ value: 'badge', label: 'Badge' },
	{ value: 'avatar', label: 'Avatar' },
	{ value: 'progress', label: 'Progress' },
	{ value: 'breadcrumb', label: 'Breadcrumb' },
	{ value: 'pagination', label: 'Pagination' },
	{ value: 'responsive', label: 'Responsive' },
	{ value: 'mobile', label: 'Mobile' },
	{ value: 'desktop', label: 'Desktop' },
	{ value: 'dark-mode', label: 'Dark Mode' },
	{ value: 'animation', label: 'Animation' },
	{ value: 'interactive', label: 'Interactive' },
	{ value: 'utility', label: 'Utility' }
];

const componentSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['blocks', 'templates']),
	tags: z
		.array(
			z.object({
				value: z.string(),
				label: z.string()
			})
		)
		.min(1, 'At least one tag is required'),
	author: z.string().min(1, 'Author is required')
});

type ComponentFormValues = z.infer<typeof componentSchema>;

interface ComponentFormProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Component) => void;
	editingComponent?: Component | null;
}

export function ComponentForm({
	open,
	onClose,
	onSubmit,
	editingComponent
}: ComponentFormProps) {
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ComponentFormValues>({
		resolver: zodResolver(componentSchema),
		defaultValues: {
			name: editingComponent?.metadata.name || '',
			type: editingComponent?.type || 'blocks',
			tags:
				editingComponent?.metadata.tags?.map((tag) => ({
					value: tag,
					label: tag.charAt(0).toUpperCase() + tag.slice(1)
				})) || [],
			author: editingComponent?.metadata.author || ''
		}
	});

	const watchedType = watch('type');
	const watchedTags = watch('tags');

	React.useEffect(() => {
		if (editingComponent) {
			reset({
				name: editingComponent.metadata.name,
				type: editingComponent.type,
				tags: editingComponent.metadata.tags.map((tag) => ({
					value: tag,
					label: tag.charAt(0).toUpperCase() + tag.slice(1)
				})),
				author: editingComponent.metadata.author
			});
		} else {
			reset({
				name: '',
				type: 'blocks',
				tags: [],
				author: ''
			});
		}
	}, [editingComponent, reset]);

	const handleFormSubmit = async (data: ComponentFormValues) => {
		// Generate new ID from the name (for both create and update)
		const newId = data.name.toLowerCase().replace(/\s+/g, '-');

		const component: Component = {
			metadata: {
				id: newId,
				name: data.name,
				tags: data.tags.map((tag) => tag.value),
				author: data.author
			},
			html: '<div class="p-4 bg-gray-100 rounded-lg">\n  <!-- Start building your component here -->\n  <p class="text-gray-600">Your component content goes here...</p>\n</div>',
			type: data.type,
			folder: newId
		};

		// Pass both the new component and the old ID for updates
		onSubmit(component);
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{editingComponent ? 'Edit Component' : 'Create New Component'}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="name">Component Name</Label>
							<Input
								id="name"
								{...register('name')}
								placeholder="Hero Section"
								className="mt-1"
							/>
							{errors.name && (
								<p className="text-sm text-red-500 mt-1">
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="type">Type</Label>
							<Select
								value={watchedType}
								onValueChange={(value) =>
									setValue('type', value as 'blocks' | 'templates')
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="blocks">Blocks</SelectItem>
									<SelectItem value="templates">Templates</SelectItem>
								</SelectContent>
							</Select>
							{errors.type && (
								<p className="text-sm text-red-500 mt-1">
									{errors.type.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<Label htmlFor="tags">Tags</Label>
						<MultipleSelector
							value={watchedTags as Option[]}
							onChange={(options) => setValue('tags', options)}
							defaultOptions={TAG_OPTIONS}
							placeholder="Select tags for your component..."
							emptyIndicator={
								<p className="text-center text-sm leading-10 text-muted-foreground">
									No tags found.
								</p>
							}
							className="mt-1"
							maxSelected={4}
							onMaxSelected={(maxLimit) => {
								console.log(`You can select up to ${maxLimit} tags`);
							}}
						/>
						{errors.tags && (
							<p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>
						)}
					</div>

					<div>
						<Label htmlFor="author">Author</Label>
						<Input
							id="author"
							{...register('author')}
							placeholder="Your Name"
							className="mt-1"
						/>
						{errors.author && (
							<p className="text-sm text-red-500 mt-1">
								{errors.author.message}
							</p>
						)}
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? 'Saving...'
								: editingComponent
									? 'Update'
									: 'Create'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
