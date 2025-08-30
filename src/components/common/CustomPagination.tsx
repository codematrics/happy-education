import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

export const CustomPagination: React.FC<Props> = ({
  page,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const visiblePages = 5; // max pages to show before adding ellipsis

    let startPage = Math.max(1, page - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={i === page} onClick={() => onPageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis for skipped pages
    if (startPage > 1) {
      pages.unshift(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
      pages.unshift(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        {hasPrev && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => hasPrev && onPageChange(page - 1)}
              aria-label="पिछला" // Hindi for Previous
            >
              पिछला
            </PaginationPrevious>
          </PaginationItem>
        )}
        {renderPageNumbers()}
        {hasNext && (
          <PaginationItem>
            <PaginationNext
              onClick={() => hasNext && onPageChange(page + 1)}
              aria-label="अगला" // Hindi for Next
            >
              अगला
            </PaginationNext>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
