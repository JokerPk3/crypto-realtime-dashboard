import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-zinc-900">
          <tr className="border-b border-zinc-800">
            {columns.map(column => (
              <th
                key={String(column.accessor)}
                className={`
                  px-4
                  py-3
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-zinc-400
                  ${column.className || ''}
                `}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="
                  border-b
                  border-zinc-800/50
                  hover:bg-zinc-800/40
                  transition-colors
                "
              >
                {columns.map(column => (
                  <td
                    key={String(column.accessor)}
                    className={`
                      px-4
                      py-3
                      text-zinc-200
                      font-mono
                      ${column.className || ''}
                    `}
                  >
                    {column.render
                      ? column.render(row)
                      : String(row[column.accessor])}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="
                  py-8
                  text-center
                  text-zinc-500
                "
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}