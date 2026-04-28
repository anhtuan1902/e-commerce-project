import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomTableProps {
  data: {
    data: any[];
    total_items: number;
    total_pages: number;
  };
  columns: ColumnDef<any>[];
  loading?: boolean;
  pageSize?: number;
  setPageSize?: (pageSize: number) => void;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  /** Action buttons rendered top-left (e.g. Reset Password, End Session, Delete) */
  list_button_actions?: React.ReactNode[];
  objectSearch?: {
    search_columns: { [key: string]: string }[];
    sort_columns: { [key: string]: 'asc' | 'desc' } | null;
  };
  setObjectSearch?: (obj: {
    search_columns: { [key: string]: string }[];
    sort_columns: { [key: string]: 'asc' | 'desc' } | null;
  }) => void;
  manualFiltering?: boolean;
  manualSorting?: boolean;
}

const getSearchFilters = (search_columns: { [key: string]: string }[]): ColumnFiltersState =>
  search_columns && Array.isArray(search_columns)
    ? search_columns
        .filter((item) => item && Object.keys(item).length > 0)
        .map((filter) => ({ id: Object.keys(filter)[0], value: Object.values(filter)[0] }))
    : [];

const getSearchColumns = (filters: ColumnFiltersState) =>
  filters && filters.length > 0
    ? filters
        .filter((filter) => filter.value !== '')
        .map((filter) => ({ [filter.id as string]: filter.value as string }))
    : [];

const getSortColumns = (sorting: SortingState): { [key: string]: 'asc' | 'desc' } | null => {
  if (sorting.length === 0) return null;
  const direction: 'asc' | 'desc' = sorting[0].desc ? 'desc' : 'asc';
  return { [sorting[0].id]: direction };
};

const getSortingState = (sort_columns: { [key: string]: 'asc' | 'desc' } | null): SortingState =>
  sort_columns
    ? Object.entries(sort_columns)?.map(([id, direction]) => ({ id, desc: direction === 'desc' }))
    : [];

// ─── Icons ────────────────────────────────────────────────────────────────────

const SortIcon = ({ state }: { state: false | 'asc' | 'desc' }) => (
  <span className='inline-flex flex-col items-center gap-px'>
    <svg width='7' height='4' viewBox='0 0 7 4'>
      <path d='M3.5 0L7 4H0L3.5 0Z' fill={state === 'asc' ? '#1677ff' : '#ccc'} />
    </svg>
    <svg width='7' height='4' viewBox='0 0 7 4'>
      <path d='M3.5 4L0 0H7L3.5 4Z' fill={state === 'desc' ? '#1677ff' : '#ccc'} />
    </svg>
  </span>
);

const ChevLeft = () => (
  <svg width='5' height='9' viewBox='0 0 5 9' fill='none'>
    <path
      d='M4.5 1L1 4.5L4.5 8'
      stroke='currentColor'
      strokeWidth='1.3'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const ChevRight = () => (
  <svg width='5' height='9' viewBox='0 0 5 9' fill='none'>
    <path
      d='M0.5 1L4 4.5L0.5 8'
      stroke='currentColor'
      strokeWidth='1.3'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

// ─── Pagination pages ─────────────────────────────────────────────────────────

function getPages(cur: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const p: (number | '...')[] = [];
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) p.push(i);
    p.push('...');
    p.push(total);
  } else if (cur >= total - 3) {
    p.push(1);
    p.push('...');
    for (let i = total - 4; i <= total; i++) p.push(i);
  } else {
    p.push(1);
    p.push('...');
    for (let i = cur - 1; i <= cur + 1; i++) p.push(i);
    p.push('...');
    p.push(total);
  }
  return p;
}

// ─── Component ────────────────────────────────────────────────────────────────

function CustomTable({
  data,
  columns = [],
  loading = false,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  list_button_actions = [],
  objectSearch,
  setObjectSearch,
  manualFiltering,
  manualSorting,
}: CustomTableProps) {
  const [sorting, setSorting] = useState<SortingState>(
    getSortingState(objectSearch?.sort_columns ?? null),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    getSearchFilters(objectSearch?.search_columns ?? []),
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: currentPage ? currentPage - 1 : 0,
    pageSize: pageSize ?? 10,
  });

  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  console.log(objectSearch);

  useEffect(() => {
    if (currentPage !== undefined) {
      setPagination((prev) => ({ ...prev, pageIndex: currentPage - 1 }));
    }
  }, [currentPage]);

  useEffect(() => {
    if (pageSize !== undefined) {
      setPagination((prev) => ({ ...prev, pageSize }));
    }
  }, [pageSize]);

  const effectivePageIndex = pagination.pageIndex;
  const pageSizeState = pagination.pageSize;

  const isManualFiltering = manualFiltering ?? Boolean(setObjectSearch);
  const isManualSorting = manualSorting ?? Boolean(setObjectSearch);

  const emitSearch = (nextSorting: SortingState, nextFilters: ColumnFiltersState) => {
    const search_columns = getSearchColumns(nextFilters);
    const sort_columns = getSortColumns(nextSorting);
    setObjectSearch?.({ search_columns, sort_columns });
  };

  const handleFilterChange = (colId: string, value: string) => {
    const next = columnFilters.filter((filter) => filter.id !== colId);
    if (value !== '') {
      next.push({ id: colId, value });
    }
    setColumnFilters(next);
    if (setCurrentPage) {
      setCurrentPage(1);
    } else {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }

    if (isManualFiltering) {
      clearTimeout(debounceRef.current[colId]);
      debounceRef.current[colId] = setTimeout(() => emitSearch(sorting, next), 300);
      return;
    }
  };

  const handleSortingChange = (updater: any) => {
    const next: SortingState = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(next);
    if (setCurrentPage) {
      setCurrentPage(1);
    } else {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
    emitSearch(next, columnFilters);
  };

  const handlePageChange = (pi: number) => {
    if (setCurrentPage) {
      setCurrentPage(pi + 1);
    } else {
      setPagination((prev) => ({ ...prev, pageIndex: pi }));
    }
  };

  const handlePageSizeChange = (ps: number) => {
    if (setPageSize) {
      setPageSize(ps);
    } else {
      setPagination((prev) => ({ ...prev, pageSize: ps, pageIndex: 0 }));
    }

    if (setCurrentPage) {
      setCurrentPage(1);
    }
  };

  // ── Checkbox column ───────────────────────────────────────────────────────

  const checkboxCol = useMemo<ColumnDef<any>>(
    () => ({
      id: '__select__',
      enableSorting: false,
      meta: { isCheckbox: true },
      header: ({ table }) => (
        <input
          type='checkbox'
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type='checkbox'
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    }),
    [],
  );

  const allColumns = useMemo(() => [checkboxCol, ...columns], [checkboxCol, columns]);

  const isManualPagination = Boolean(setCurrentPage);

  const table = useReactTable({
    data: data.data,
    columns: allColumns,

    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },

    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    manualSorting: isManualSorting,
    manualFiltering: isManualFiltering,
    manualPagination: isManualPagination,

    pageCount: data.total_pages,
    enableRowSelection: true,
  });

  const totalPages = data.total_pages;
  const startItem = data.total_items > 0 ? effectivePageIndex * pageSizeState + 1 : 0;
  const endItem = Math.min(effectivePageIndex * pageSizeState + data.data.length, data.total_items);
  const pageNumbers = getPages(effectivePageIndex + 1, totalPages);

  return (
    <div className='rounded-3xl'>
      {/* ── Toolbar ── */}
      <div className='flex flex-col gap-3 px-4 py-3  sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap items-center gap-2'>
          {list_button_actions.map((btn, i) => (
            <span key={i}>{btn}</span>
          ))}
        </div>
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <select
            className='h-8 min-w-20 rounded-xl border border-slate-300 bg-slate-100/90 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700'
            value={pageSizeState}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className='text-slate-500 dark:text-slate-400'>
            {startItem}–{endItem} of {data.total_items}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left text-sm'>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className='bg-[#ECECEF]'>
                {hg.headers.map((header) => {
                  const colDef = header.column.columnDef as any;
                  const isCheckbox = colDef.meta?.isCheckbox;
                  const canSort = !isCheckbox && header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  const colId = colDef.accessorKey ?? header.id;
                  const searchable =
                    !isCheckbox && colDef.enableSearch !== false && colDef.accessorKey;

                  return (
                    <th
                      key={header.id}
                      className={`border-b border-slate-200/80 px-3 py-2 ${isCheckbox ? 'w-14 text-center justify-items-center' : ''}`}
                    >
                      <div className='flex flex-col gap-2'>
                        <button
                          type='button'
                          className={`flex w-full items-center justify-between gap-2 text-left font-medium ${canSort ? 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100' : 'cursor-default'}`}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(colDef.header, header.getContext())}
                          {canSort && <SortIcon state={sortState} />}
                        </button>
                        {!isCheckbox && (
                          <div className={searchable ? '' : 'invisible'}>
                            <input
                              className={`w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-700 ${searchable && String(columnFilters.find((filter) => filter.id === colId)?.value) ? 'border-slate-500 bg-slate-100 dark:border-slate-500 dark:bg-slate-700' : ''}`}
                              value={String(
                                columnFilters.find((filter) => filter.id === colId)?.value ?? '',
                              )}
                              onChange={(e) => handleFilterChange(colId, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              readOnly={!searchable}
                              tabIndex={searchable ? 0 : -1}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr className='bg-transparent'>
                <td
                  colSpan={allColumns.length}
                  className='py-12 text-center text-sm text-slate-500 dark:text-slate-400'
                >
                  <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-200 mr-2' />
                  Loading…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={allColumns.length}
                  className='py-12 text-center text-sm text-slate-500 dark:text-slate-400'
                >
                  No data
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${row.getIsSelected() ? 'bg-slate-100/80' : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70'}`}
                  onClick={() => row.toggleSelected()}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isCheckbox = (cell.column.columnDef as any).meta?.isCheckbox;
                    return (
                      <td
                        key={cell.id}
                        className={`border-b border-slate-200/80 px-3 py-3 align-middle ${isCheckbox ? 'text-center' : ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 0 && (
        <div className='flex flex-wrap items-center justify-center gap-2 border-t border-slate-200/80 px-4 py-3 '>
          <button
            type='button'
            className='inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
            disabled={effectivePageIndex === 0}
            onClick={() => handlePageChange(effectivePageIndex - 1)}
          >
            <ChevLeft />
          </button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span
                key={`e${i}`}
                className='inline-flex h-9 min-w-9 items-center justify-center rounded-xl text-sm text-slate-500 dark:text-slate-400'
              >
                ···
              </span>
            ) : (
              <button
                key={p}
                type='button'
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-medium transition ${effectivePageIndex + 1 === p ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-300 dark:bg-slate-300 dark:text-slate-950' : 'border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500'}`}
                onClick={() => handlePageChange((p as number) - 1)}
              >
                {p}
              </button>
            ),
          )}

          <button
            type='button'
            className='inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
            disabled={effectivePageIndex >= totalPages - 1}
            onClick={() => handlePageChange(effectivePageIndex + 1)}
          >
            <ChevRight />
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(CustomTable);
