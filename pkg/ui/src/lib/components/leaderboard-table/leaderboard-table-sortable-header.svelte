<script lang="ts">
  import type { ComponentProps } from "svelte";
  import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
  import { Button } from "$lib/components/ui/button/index.js";

  type Props = {
    name: string;
  };

  let { name, variant = "ghost", ...restProps }: ComponentProps<typeof Button> & Props = $props();
</script>

<Button {variant} {...restProps}>
  {name}
  <ArrowUpDownIcon class="ml-2" />
</Button>
