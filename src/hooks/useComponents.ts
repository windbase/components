import { useCallback, useEffect, useState } from 'react';
import type { Component } from '../types/component';

interface PaginatedResponse {
	data: Component[];
	currentPage: number;
	totalPages: number;
	totalItems: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export function useComponents() {
	const [components, setComponents] = useState<Component[]>([]);
	const [loading, setLoading] = useState(true);
	const [paginationData, setPaginationData] = useState<
		Omit<PaginatedResponse, 'data'>
	>({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		hasNextPage: false,
		hasPreviousPage: false
	});

	const loadComponents = useCallback(async (
		page: number = 1,
		limit: number = 12,
		type: string = 'all'
	) => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				type: type
			});

			const response = await fetch(`/api/components?${params}`);
			const result = await response.json();

			if (result.success) {
				setComponents(result.data);
				setPaginationData({
					currentPage: result.currentPage,
					totalPages: result.totalPages,
					totalItems: result.totalItems,
					hasNextPage: result.hasNextPage,
					hasPreviousPage: result.hasPreviousPage
				});
			} else {
				console.error('Error loading components:', result.error);
			}
		} catch (error) {
			console.error('Error loading components:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	const createComponent = async (componentData: Component) => {
		try {
			const response = await fetch('/api/components', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(componentData)
			});

			const result = await response.json();

			if (result.success) {
				setComponents((prev) => [...prev, componentData]);
			} else {
				console.error('Error creating component:', result.error);
			}

			return result.success;
		} catch (error) {
			console.error('Error creating component:', error);
			return false;
		}
	};

	const updateComponent = async (
		originalId: string,
		componentData: Component,
		nameChanged: boolean = false
	) => {
		try {
			const response = await fetch(`/api/components/${originalId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					component: componentData, 
					nameChanged
				})
			});

			const result = await response.json();

			if (result.success) {
				if (nameChanged) {
					// Remove old component and add new one (reflecting folder move)
					setComponents((prev) =>
						prev.filter((comp) => comp.metadata.id !== originalId)
					);
					setComponents((prev) => [...prev, componentData]);
				} else {
					// Update existing component
					setComponents((prev) =>
						prev.map((comp) =>
							comp.metadata.id === originalId ? componentData : comp
						)
					);
				}
			} else {
				console.error('Error updating component:', result.error);
			}

			return result.success;
		} catch (error) {
			console.error('Error updating component:', error);
			return false;
		}
	};

	const deleteComponent = async (id: string) => {
		try {
			const response = await fetch(`/api/components/${id}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (result.success) {
				setComponents((prev) => prev.filter((comp) => comp.metadata.id !== id));
			} else {
				console.error('Error deleting component:', result.error);
			}

			return result.success;
		} catch (error) {
			console.error('Error deleting component:', error);
			return false;
		}
	};

	  useEffect(() => {
    loadComponents(1, 12, 'blocks');
  }, [loadComponents]);

	return {
		components,
		loading,
		paginationData,
		loadComponents,
		createComponent,
		updateComponent,
		deleteComponent,
		refetch: loadComponents
	};
}
