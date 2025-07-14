import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Component } from '../types/component';

const componentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['blocks', 'templates']),
  html: z.string().min(1, 'HTML code is required'),
  tags: z.string().min(1, 'Tags are required'),
  author: z.string().min(1, 'Author is required'),
});

type ComponentFormValues = z.infer<typeof componentSchema>;

interface ComponentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Component) => void;
  editingComponent?: Component | null;
}

export function ComponentForm({ open, onClose, onSubmit, editingComponent }: ComponentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComponentFormValues>({
    resolver: zodResolver(componentSchema),
    defaultValues: {
      name: editingComponent?.metadata.name || '',
      type: editingComponent?.type || 'blocks',
      html: editingComponent?.html || '',
      tags: editingComponent?.metadata.tags.join(', ') || '',
      author: editingComponent?.metadata.author || '',
    },
  });

  const watchedType = watch('type');

  React.useEffect(() => {
    if (editingComponent) {
      reset({
        name: editingComponent.metadata.name,
        type: editingComponent.type,
        html: editingComponent.html,
        tags: editingComponent.metadata.tags.join(', '),
        author: editingComponent.metadata.author,
      });
    } else {
      reset({
        name: '',
        type: 'blocks',
        html: '',
        tags: '',
        author: '',
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
        tags: data.tags.split(',').map(tag => tag.trim()),
        author: data.author,
      },
      html: data.html,
      type: data.type,
      folder: newId,
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
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={watchedType}
                onValueChange={(value) => setValue('type', value as 'blocks' | 'templates')}
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
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
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
              <p className="text-sm text-red-500 mt-1">{errors.author.message}</p>
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

          <div>
            <Label htmlFor="html">HTML Code</Label>
            <Textarea
              id="html"
              {...register('html')}
              placeholder="<div class='bg-blue-500 text-white p-4'>Your component HTML here...</div>"
              className="mt-1 min-h-[200px] font-mono"
            />
            {errors.html && (
              <p className="text-sm text-red-500 mt-1">{errors.html.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingComponent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 