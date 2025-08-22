<script lang="ts">
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import SiSteam from "@icons-pack/svelte-simple-icons/icons/SiSteam";
  import { scaleUtc } from "d3-scale";
  import { Area, AreaChart, LinearGradient } from "layerchart";
  import { firstStatsPerDay, type Player } from "./player";
  import { getProfileImageUrlLarge } from "$lib/profile-image";
  import PlayerProfileLatestStats from "./player-profile-latest-stats.svelte";
  import Button from "../ui/button/button.svelte";
  import { SteamIdType } from "common";
  import * as Card from "$lib/components/ui/card/index.js";
  import { SvelteDate } from "svelte/reactivity";
  type Props = {
    player: Player;
  };

  const steamProfileUrlStem = "https://steamcommunity.com";

  const getSteamProfileUrl = (steamId: string, steamIdType: SteamIdType): string =>
    `${steamProfileUrlStem}/${steamIdType === SteamIdType.Custom ? "id" : "profiles"}/${steamId}`;

  let { player }: Props = $props();
  let latestStats = $derived(player.stats.at(-1));

  let statsInRange = $derived.by(() => {
    switch (timeRange) {
      case "all-time":
        return firstStatsPerDay(player.stats);
      case "30d": {
        const threshold = new SvelteDate();
        threshold.setMonth(threshold.getMonth() - 1);
        return player.stats.filter((s) => s.date > threshold);
      }
      case "7d": {
        const threshold = new SvelteDate();
        threshold.setDate(threshold.getDate() - 7);
        return player.stats.filter((s) => s.date > threshold);
      }
    }
  });

  let highestScoreValue = $derived(
    statsInRange
      .map((p) => p.totalScore)
      .filter((p): p is number => Boolean(p))
      .reduce((prev, curr) => (prev < curr ? curr : prev)),
  );

  type TimeRange = "all-time" | "30d" | "7d";

  let timeRange: TimeRange = $state("30d");

  const selectedLabel = $derived.by(() => {
    switch (timeRange) {
      case "all-time":
        return "All time";
      case "30d":
        return "Last month";
      case "7d":
        return "Last 7 days";
    }
  });

  const chartConfig = {
    totalScore: {
      label: "Total Score",
      color: "var(--accent2)",
    },
    pvpScore: {
      label: "PvP Score",
      color: "var(--chart-1)",
    },
  } satisfies Chart.ChartConfig;
</script>

<div class="flex flex-row gap-2 pb-16 lg:gap-8">
  <div class="flex shrink-0 flex-col items-center gap-2">
    <img
      class="h-[164px] w-[164px] border-4"
      src={getProfileImageUrlLarge(player.profileImageId)}
      alt="Profile"
    />
    <Button
      href={getSteamProfileUrl(player.steamId, player.steamIdType)}
      class="align-end"
      variant="outline"><SiSteam /> View on Steam</Button
    >
  </div>
  <div class="flex flex-col items-start pt-2">
    <span class="pb-2 text-2xl lg:pb-8 lg:text-4xl">{player.name}</span>
    {#if latestStats}
      <PlayerProfileLatestStats stats={latestStats} />
    {/if}
  </div>
</div>

<Card.Root class="@container/card rounded-none lg:rounded-lg">
  <Card.Header>
    <Card.Title>Score over time</Card.Title>
    <Card.Action>
      <ToggleGroup.Root
        type="single"
        bind:value={timeRange}
        variant="outline"
        class="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
      >
        <ToggleGroup.Item value="all-time">All time</ToggleGroup.Item>
        <ToggleGroup.Item value="30d">Last month</ToggleGroup.Item>
        <ToggleGroup.Item value="7d">Last 7 days</ToggleGroup.Item>
      </ToggleGroup.Root>
      <Select.Root type="single" bind:value={timeRange}>
        <Select.Trigger
          size="sm"
          class="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
          aria-label="Select a value"
        >
          <span data-slot="select-value">
            {selectedLabel}
          </span>
        </Select.Trigger>
        <Select.Content class="rounded-xl">
          <Select.Item value="all-time" class="rounded-lg">All time</Select.Item>
          <Select.Item value="30d" class="rounded-lg">Last month</Select.Item>
          <Select.Item value="7d" class="rounded-lg">Last 7 days</Select.Item>
        </Select.Content>
      </Select.Root>
    </Card.Action>
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig} class="my-auto max-h-80 w-full">
      <AreaChart
        data={statsInRange}
        xScale={scaleUtc()}
        x="date"
        yDomain={[0, highestScoreValue]}
        legend
        seriesLayout="group"
        series={[
          {
            key: "totalScore",
            label: chartConfig.totalScore.label,
            color: chartConfig.totalScore.color,
          },
          {
            key: "pvpScore",
            label: chartConfig.pvpScore.label,
            color: chartConfig.pvpScore.color,
          },
        ]}
        props={{
          area: {
            "fill-opacity": 0.4,
            line: { class: "stroke-1" },
            motion: "tween",
          },
          legend: {
            placement: "bottom",
          },
          xAxis: {
            format: (v: Date) => {
              return v.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            },
          },
          yAxis: {
            ticks: [highestScoreValue],
            tickLabelProps: { dx: "32", dy: -8 },
          },
        }}
      >
        {#snippet tooltip()}
          <Chart.Tooltip labelFormatter={(v: Date) => v.toLocaleString()} />
        {/snippet}
        {#snippet marks({ series, getAreaProps })}
          {#each series as s, i (s.key)}
            <LinearGradient
              stops={[s.color ?? "", "color-mix(in lch, " + s.color + " 10%, transparent)"]}
              vertical
            >
              {#snippet children({ gradient })}
                <Area {...getAreaProps(s, i)} fill={gradient} />
              {/snippet}
            </LinearGradient>
          {/each}
        {/snippet}
      </AreaChart>
    </Chart.Container>
  </Card.Content>
</Card.Root>
