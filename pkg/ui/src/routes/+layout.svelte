<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Freeman&family=Roboto&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header class="bg-primary p-4 text-2xl text-primary-foreground">
  <span class="s-4">Heroes of Valor player leaderboards</span>
</header>

<main class="p-auto flex flex-col items-center">
  {@render children()}
</main>
