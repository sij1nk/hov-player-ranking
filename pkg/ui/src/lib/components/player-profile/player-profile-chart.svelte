<script lang="ts">
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { scaleUtc } from "d3-scale";
  import { Area, AreaChart, LinearGradient } from "layerchart";
  import * as Card from "$lib/components/ui/card/index.js";
  import { firstStatsPerDay, type PlayerStats } from "./player";
  import { SvelteDate } from "svelte/reactivity";

  type Props = {
    title?: string;
    stats: PlayerStats[];
    domainMaxBoundFn: (stats: PlayerStats[]) => number;
    chartConfig: Chart.ChartConfig;
  };

  let { title, stats, domainMaxBoundFn, chartConfig }: Props = $props();

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

  let statsInRange = $derived.by(() => {
    switch (timeRange) {
      case "all-time":
        return firstStatsPerDay(stats);
      case "30d": {
        const threshold = new SvelteDate();
        threshold.setMonth(threshold.getMonth() - 1);
        return stats.filter((s) => s.date > threshold);
      }
      case "7d": {
        const threshold = new SvelteDate();
        threshold.setDate(threshold.getDate() - 7);
        return stats.filter((s) => s.date > threshold);
      }
    }
  });

  let domainMaxBound = $derived(domainMaxBoundFn(statsInRange));

  let chartSeries = $derived(
    Object.entries(chartConfig).map(([k, v]) => ({
      key: k,
      label: v.label,
      color: v.color,
    })),
  );
</script>

<Card.Root class="@container/card rounded-none lg:rounded-lg">
  <Card.Header class="border-b">
    {#if title}
      <Card.Title>{title}</Card.Title>
    {/if}
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
        yDomain={[1, domainMaxBound]}
        legend
        seriesLayout="group"
        series={chartSeries}
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
            placement: "right",
            ticks: [domainMaxBound],
            tickLabelProps: { dx: "0", dy: -8, textAnchor: "end" },
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
