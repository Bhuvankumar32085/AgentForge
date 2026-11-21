import type { PaginationInfo } from "../../types/agent";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
  loading?: boolean;
}

export function Pagination({ pagination, onPageChange, loading = false }: PaginationProps) {
  const { totalAgents, totalPages, currentPage, limit, hasNextPage, hasPrevPage } = pagination;

  if (totalAgents === 0 || totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalAgents);

  // Generate page numbers array with ellipsis for many pages
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Middle pages around currentPage
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-white/10 mt-6">
      {/* Showing count text */}
      <div className="text-xs text-white/50 order-2 sm:order-1">
        Showing <strong className="text-white font-semibold">{startItem}</strong> -{" "}
        <strong className="text-white font-semibold">{endItem}</strong> of{" "}
        <strong className="text-white font-semibold">{totalAgents}</strong> agents
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          className="h-9 px-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10 text-xs gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-9 flex items-center justify-center text-xs text-white/40"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                disabled={loading || isActive}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] border border-purple-400/40"
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                } disabled:cursor-default`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          className="h-9 px-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10 text-xs gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;

