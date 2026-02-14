import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FileX } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="hover:bg-transparent hover:shadow-none border-0"
          >
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="group">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent hover:shadow-none border-0">
            <TableCell colSpan={columns.length} className="h-32 text-center">
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-full">
                  <FileX className="size-8 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No results found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    There are no items to display at this time.
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
