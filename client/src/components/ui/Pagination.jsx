import { ChevronLeft, ChevronRight } from 'lucide-react';

// Props: page, totalPages, total, limit, onPageChange
export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Generate page numbers to show: always first, last, current ± 1
  const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
  const pageArr = [...pages].sort((a, b) => a - b);

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-[0.75rem] text-gray-400">
        {from}–{to} of {total}টি
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        {pageArr.map((p, i) => (
          <>
            {i > 0 && pageArr[i] - pageArr[i - 1] > 1 && (
              <span key={`gap-${p}`} className="text-gray-300 px-1 text-[0.75rem]">…</span>
            )}
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-[0.78rem] font-semibold transition-colors ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {p}
            </button>
          </>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
