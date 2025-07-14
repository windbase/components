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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import type { Component } from '../types/component';

const componentSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['blocks', 'templates']),
	tags: z.string().min(1, 'Tags are required'),
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
			tags: editingComponent?.metadata.tags.join(', ') || '',
			author: editingComponent?.metadata.author || ''
		}
	});

	const watchedType = watch('type');

	React.useEffect(() => {
		if (editingComponent) {
			reset({
				name: editingComponent.metadata.name,
				type: editingComponent.type,
				tags: editingComponent.metadata.tags.join(', '),
				author: editingComponent.metadata.author
			});
		} else {
			reset({
				name: '',
				type: 'blocks',
				tags: '',
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
				tags: data.tags.split(',').map((tag) => tag.trim()),
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

					<div>
						<Label htmlFor="tags">Tags (comma-separated)</Label>
						<Input
							id="tags"
							{...register('tags')}
							placeholder="header, hero, call-to-action"
							className="mt-1"
						/>
						{errors.tags && (
							<p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>
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
