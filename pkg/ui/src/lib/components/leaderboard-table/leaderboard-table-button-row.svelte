<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import Button from "../ui/button/button.svelte";
  import * as Table from "$lib/components/ui/table/index.js";

  type Props = {
    buttonProps?: ComponentProps<typeof Button>;
    children: Snippet;
  };

  let { buttonProps, children, ...restProps }: Props & ComponentProps<typeof Table.Row> = $props();
</script>

<Table.Row {...restProps}>
  <Button {...buttonProps}>
    {@render children()}
  </Button>
</Table.Row>
