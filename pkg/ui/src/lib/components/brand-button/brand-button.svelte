<script lang="ts">
  import Button from "../ui/button/button.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    href: string;
    children: Snippet;
  };

  let { href, children }: Props = $props();
</script>

<!-- shadcn-svelte forces a small size on svgs within buttons, which we need to override -->
<Button {href} size="icon" class="hover:text-(--accent) [&_svg:not([class*='size-'])]:size-6">
  {@render children()}
</Button>
