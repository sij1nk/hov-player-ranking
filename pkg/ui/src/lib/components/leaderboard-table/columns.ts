import { createColumnHelper, type ColumnDef } from "@tanstack/table-core";
import { renderComponent, renderSnippet } from "../ui/data-table";
import LeaderboardTableSortableHeader from "./leaderboard-table-sortable-header.svelte";
import { createRawSnippet } from "svelte";

export type LeaderboardEntry = {
  name: string;
  profileImageUrl: string | undefined;
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
    cell: (params) => {
      const profileImageUrl = params.row.original.profileImageUrl;
      const name = params.row.original.name;

      const snippet = createRawSnippet(() => ({
        render: () =>
          `<div class="flex items-center gap-2">
            <img src=${profileImageUrl} class="w-8 h-8 rounded-full"/>
            <span>${name}</span>
          </div>`,
      }));

      return renderSnippet(snippet, "");
    },
  },
  {
    accessorKey: "pvpRank",
    header: ({ column, table }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        id: "pvpRank",
        name: "PvP Rank",
        sortingState: table.getState().sorting,
        onclick: column.getToggleSortingHandler(),
      }),
    sortUndefined: 1,
    invertSorting: true,
  },
  {
    accessorKey: "pvpScore",
    header: ({ column, table }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        id: "pvpScore",
        name: "PvP Score",
        sortingState: table.getState().sorting,
        onclick: column.getToggleSortingHandler(),
      }),
    cell: (value) => value.getValue<number>()?.toLocaleString(),
    sortUndefined: -1,
  },
  {
    accessorKey: "totalRank",
    header: ({ column, table }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        id: "totalRank",
        name: "Total Rank",
        sortingState: table.getState().sorting,
        onclick: column.getToggleSortingHandler(),
      }),
    sortUndefined: 1,
    invertSorting: true,
  },
  {
    accessorKey: "totalScore",
    header: ({ column, table }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        id: "totalScore",
        name: "Total Score",
        sortingState: table.getState().sorting,
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
    sortingFn: (rowA, rowB) => rowB.original.scoreRatioMin - rowA.original.scoreRatioMin,
    invertSorting: true,
    sortDescFirst: true,
    header: ({ column, table }) =>
      renderComponent(LeaderboardTableSortableHeader, {
        id: "scoreRatio",
        name: "Score Ratio",
        sortingState: table.getState().sorting,
        onclick: column.getToggleSortingHandler(),
      }),
  },
];
