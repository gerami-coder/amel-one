"use client";
import Link from "next/link";
import {
  createTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
export type RegistrationRow = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  registration_types: { name: string } | null;
};
export function RegistrationsTable({
  rows,
  eventId,
}: {
  rows: RegistrationRow[];
  eventId: string;
}) {
  const columns = useMemo<ColumnDef<RegistrationRow>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Attendee",
        cell: ({ row }) => (
          <Link
            className="text-link"
            href={
              "/dashboard/events/" +
              eventId +
              "/registrations/" +
              row.original.id
            }
          >
            {row.original.full_name}
          </Link>
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        id: "type",
        header: "Type",
        accessorFn: (r) => r.registration_types?.name ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={"status " + row.original.status}>
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Registered",
        cell: ({ row }) =>
          new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
            timeZone: "UTC",
          }).format(new Date(row.original.created_at)),
      },
    ],
    [eventId],
  );
  const table = useMemo(() => {
    const instance = createTable({
      data: rows,
      columns,
      state: {},
      onStateChange: () => {},
      renderFallbackValue: null,
      getCoreRowModel: getCoreRowModel(),
    });
    instance.setOptions((previous) => ({
      ...previous,
      state: instance.initialState,
    }));
    return instance;
  }, [rows, columns]);
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Registrations table"
    >
      <table>
        <thead>
          {table.getHeaderGroups().map((g) => (
            <tr key={g.id}>
              {g.headers.map((h) => (
                <th key={h.id} scope="col">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => (
            <tr key={r.id}>
              {r.getVisibleCells().map((c) => (
                <td key={c.id}>
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
