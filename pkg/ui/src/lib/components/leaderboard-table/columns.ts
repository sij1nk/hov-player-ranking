import { type ColumnDef } from "@tanstack/table-core";
import { renderComponent, renderSnippet } from "../ui/data-table";
import LeaderboardTableSortableHeader from "./leaderboard-table-sortable-header.svelte";
import { createRawSnippet } from "svelte";
import type { PlayerLeaderboardStats } from "$lib/types";
import { getProfileImageUrl } from "$lib/profile-image";
import type { RenderSnippetConfig } from "../ui/data-table/render-helpers";

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

export function toLeaderboardEntry(stats: PlayerLeaderboardStats): LeaderboardEntry {
  return {
    name: stats.player.name,
    profileImageUrl: getProfileImageUrl(stats.player.profileImageId),
    pvpRank: stats.pvpRank ?? undefined,
    pvpScore: stats.pvpScore ?? undefined,
    totalRank: stats.totalRank ?? undefined,
    totalScore: stats.totalScore ?? undefined,
    scoreRatioMin: stats.scoreRatioMin,
    scoreRatioMax: stats.scoreRatioMax,
  };
}

function centerSortableColumnCell(value: unknown): RenderSnippetConfig<unknown> {
  const snippet = createRawSnippet(() => ({
    render: () => `<div class="text-center md:pr-4 lg:pr-8">${value}</div>`,
  }));
  return renderSnippet(snippet);
}

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

      return renderSnippet(snippet);
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
    cell: (value) => {
      const v = value.getValue();
      if (!v) return "";
      return centerSortableColumnCell(v);
    },
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
    cell: (value) => {
      const v = value.getValue();
      if (!v) return "";
      return centerSortableColumnCell(v.toLocaleString());
    },
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
    cell: (value) => {
      const v = value.getValue();
      if (!v) return "";
      return centerSortableColumnCell(v);
    },
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
    cell: (value) => {
      const v = value.getValue();
      if (!v) return "";
      return centerSortableColumnCell(v.toLocaleString());
    },
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
    cell: (value) => {
      const v = value.getValue();
      if (!v) return "";
      const snippet = createRawSnippet(() => ({
        render: () => `<div class="pl-4">${v}</div>`,
      }));
      return renderSnippet(snippet);
    },
  },
];
