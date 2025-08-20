import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "../ui/data-table";
import LeaderboardTableSortableHeader from "./leaderboard-table-sortable-header.svelte";

export type LeaderboardEntry = {
  name: string;
  pvpRank: number | undefined;
  pvpScore: number | undefined;
  totalRank: number | undefined;
  totalScore: number | undefined;
  scoreRatioMin: number;
  scoreRatioMax: number;
};

export const columns: ColumnDef<LeaderboardEntry>[] = [
  {
    cell: ({ row, table }) =>
      (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
    header: "#",
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "pvpRank",
    header: ({ column }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        name: "PvP Rank",
        onclick: column.getToggleSortingHandler(),
      }),
    sortUndefined: 1,
    invertSorting: true,
  },
  {
    accessorKey: "pvpScore",
    header: ({ column }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        name: "PvP Score",
        onclick: column.getToggleSortingHandler(),
      }),
    cell: (value) => value.getValue()?.toLocaleString(),
    sortUndefined: -1,
  },
  {
    accessorKey: "totalRank",
    header: ({ column }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        name: "Total Rank",
        onclick: column.getToggleSortingHandler(),
      }),
    sortUndefined: 1,
    invertSorting: true,
  },
  {
    accessorKey: "totalScore",
    header: ({ column }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        name: "Total Score",
        onclick: column.getToggleSortingHandler(),
      }),
    cell: (value) => value.getValue()?.toLocaleString(),
    sortUndefined: -1,
  },
  {
    id: "scoreRatio",
    accessorFn: (e: LeaderboardEntry) =>
      e.scoreRatioMin === e.scoreRatioMax
        ? e.scoreRatioMin.toFixed(3)
        : `${e.scoreRatioMin.toFixed(3)} - ${e.scoreRatioMax.toFixed(3)}`,
    sortingFn: (rowA, rowB) => rowA.original.scoreRatioMin - rowB.original.scoreRatioMin,
    invertSorting: true,
    header: ({ column }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        name: "Score Ratio",
        onclick: column.getToggleSortingHandler(),
      }),
  },
];
