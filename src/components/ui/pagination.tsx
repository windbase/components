import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showFirstLast?: boolean;
	maxVisiblePages?: number;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	showFirstLast = true,
	maxVisiblePages = 5
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const getVisiblePages = () => {
		const pages: { value: number | string; key: string }[] = [];
		const halfVisible = Math.floor(maxVisiblePages / 2);

		let start = Math.max(1, currentPage - halfVisible);
		let end = Math.min(totalPages, currentPage + halfVisible);

		// Adjust if we're near the beginning or end
		if (currentPage <= halfVisible) {
			end = Math.min(totalPages, maxVisiblePages);
		} else if (currentPage + halfVisible >= totalPages) {
			start = Math.max(1, totalPages - maxVisiblePages + 1);
		}

		// Add first page and ellipsis if needed
		if (start > 1) {
			pages.push({ value: 1, key: 'page-1' });
			if (start > 2) {
				pages.push({ value: '...', key: 'ellipsis-start' });
			}
		}

		// Add visible pages
		for (let i = start; i <= end; i++) {
			pages.push({ value: i, key: `page-${i}` });
		}

		// Add ellipsis and last page if needed
		if (end < totalPages) {
			if (end < totalPages - 1) {
				pages.push({ value: '...', key: 'ellipsis-end' });
			}
			pages.push({ value: totalPages, key: `page-${totalPages}` });
		}

		return pages;
	};

	const visiblePages = getVisiblePages();

	return (
		<div className="flex items-center justify-center gap-2 py-4">
			{/* Previous Button */}
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="flex items-center gap-1"
			>
				<ChevronLeft className="w-4 h-4" />
				Previous
			</Button>

			{/* Page Numbers */}
			<div className="flex items-center gap-1">
				{visiblePages.map((page) => (
					<div key={page.key}>
						{page.value === '...' ? (
							<Button variant="ghost" size="sm" disabled>
								<MoreHorizontal className="w-4 h-4" />
							</Button>
						) : (
							<Button
								variant={currentPage === page.value ? 'default' : 'outline'}
								size="sm"
								onClick={() => onPageChange(page.value as number)}
								className="min-w-[2.5rem]"
							>
								{page.value}
							</Button>
						)}
					</div>
				))}
			</div>

			{/* Next Button */}
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="flex items-center gap-1"
			>
				Next
				<ChevronRight className="w-4 h-4" />
			</Button>
		</div>
	);
}

// Helper hook for pagination logic
export function usePagination<T>(items: T[], itemsPerPage: number = 12) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(items.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentItems = items.slice(startIndex, endIndex);

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const goToFirstPage = () => goToPage(1);
	const goToLastPage = () => goToPage(totalPages);
	const goToPreviousPage = () => goToPage(currentPage - 1);
	const goToNextPage = () => goToPage(currentPage + 1);

	return {
		currentPage,
		totalPages,
		currentItems,
		goToPage,
		goToFirstPage,
		goToLastPage,
		goToPreviousPage,
		goToNextPage,
		hasNextPage: currentPage < totalPages,
		hasPreviousPage: currentPage > 1,
		startIndex: startIndex + 1,
		endIndex: Math.min(endIndex, items.length),
		totalItems: items.length
	};
}
