'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { PaginationMeta } from '@/lib/types';

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  meta?: PaginationMeta;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

export default function DataTable<T>({
  columns,
  data,
  meta,
  loading,
  onPageChange,
  onPerPageChange,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.last_page ?? 0,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-slate-200 bg-slate-50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <Loader2 className="mx-auto animate-spin text-blue-500" size={28} />
                  <p className="mt-2 text-sm text-slate-500">Memuat data...</p>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <p className="text-slate-400 font-medium">Tidak ada data</p>
                  <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau tambah data baru</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Tampilkan</span>
            <select
              value={meta.per_page}
              onChange={(e) => onPerPageChange?.(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <span>dari <strong>{meta.total}</strong> data</span>
          </div>

          <div className="flex items-center gap-1">
            <PageBtn onClick={() => onPageChange?.(1)} disabled={meta.current_page === 1}><ChevronsLeft size={14} /></PageBtn>
            <PageBtn onClick={() => onPageChange?.(meta.current_page - 1)} disabled={meta.current_page === 1}><ChevronLeft size={14} /></PageBtn>
            <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
              {meta.current_page} / {meta.last_page}
            </span>
            <PageBtn onClick={() => onPageChange?.(meta.current_page + 1)} disabled={meta.current_page === meta.last_page}><ChevronRight size={14} /></PageBtn>
            <PageBtn onClick={() => onPageChange?.(meta.last_page)} disabled={meta.current_page === meta.last_page}><ChevronsRight size={14} /></PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PageBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
