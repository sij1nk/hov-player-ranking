<script lang="ts">
  import BrandButton from "$lib/components/brand-button/brand-button.svelte";
  import "../app.css";
  import SiDiscord from "@icons-pack/svelte-simple-icons/icons/SiDiscord";
  import SiGithub from "@icons-pack/svelte-simple-icons/icons/SiGithub";
  import SiSteam from "@icons-pack/svelte-simple-icons/icons/SiSteam";

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

<div
  class="flex h-screen w-screen flex-col bg-[url($lib/assets/background.webp)] bg-cover
  bg-no-repeat"
>
  <header class="bg-primary p-4 text-lg text-primary-foreground lg:text-xl xl:text-2xl">
    <div class="mx-auto flex w-full flex-row items-center justify-between lg:w-4xl">
      <a href="/" class="s-4 text-(--accent)">Heroes of Valor player ranking</a>
      <div class="flex flex-row items-center gap-2">
        <BrandButton href="https://github.com/sij1nk/hov-player-ranking">
          <SiGithub />
        </BrandButton>
        <BrandButton href="https://discord.com/invite/SQEYH4wJ7d">
          <SiDiscord />
        </BrandButton>
        <BrandButton href="https://store.steampowered.com/app/2504090/Heroes_of_Valor/">
          <SiSteam />
        </BrandButton>
      </div>
    </div>
  </header>

  <main class="relative mx-auto flex min-h-0 w-screen max-w-5xl grow flex-col items-center">
    {@render children()}
  </main>
</div>
<footer class="h-[200px] bg-primary"></footer>
