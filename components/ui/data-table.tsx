'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | 'actions'
  label: string
  render?: (item: T) => ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyState?: ReactNode
  className?: string
  rowClassName?: string
  onRowClick?: (item: T) => void
  keyExtractor?: (item: T) => string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  className,
  rowClassName,
  onRowClick,
  keyExtractor = (item) => item.id || item._id
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
        <div className="p-12 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4">Cargando...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
        {emptyState}
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  onRowClick && "cursor-pointer",
                  rowClassName
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn("px-6 py-4 whitespace-nowrap", column.className)}
                  >
                    {column.render
                      ? column.render(item)
                      : column.key !== 'actions'
                      ? String(item[column.key] || '-')
                      : null}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-6 hover:bg-gray-50 transition-colors",
              onRowClick && "cursor-pointer",
              rowClassName
            )}
            onClick={() => onRowClick?.(item)}
          >
            <div className="space-y-3">
              {columns
                .filter(col => col.key !== 'actions')
                .map((column) => (
                  <div key={String(column.key)} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                      {column.render
                        ? column.render(item)
                        : String(item[column.key] || '-')}
                    </span>
                  </div>
                ))}

              {/* Actions in mobile */}
              {columns.find(col => col.key === 'actions')?.render && (
                <div className="pt-3 border-t border-gray-100">
                  {columns.find(col => col.key === 'actions')?.render?.(item)}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}