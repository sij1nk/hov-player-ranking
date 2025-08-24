<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>HoV player ranking</title>
  <link rel="icon" href="/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Freeman&family=Roboto&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="w-screen bg-[url($lib/assets/background.webp)] bg-cover bg-fixed bg-no-repeat">
  <div class="relative flex w-screen flex-col">
    <header
      class="fixed top-0 right-0 left-0 z-10 bg-primary p-4 text-lg text-primary-foreground lg:text-xl xl:text-2xl"
    >
      <div class="mx-auto flex w-full flex-row items-center justify-between lg:w-4xl">
        <a href="/" class="s-4 text-(--accent)">Heroes of Valor player ranking</a>
      </div>
    </header>

    <main class="mx-auto mt-15 flex min-h-screen w-screen max-w-5xl grow flex-col items-center">
      {@render children()}
    </main>

    <footer class="bg-primary font-[Roboto] text-xs text-(--muted-foreground) lg:h-[200px]">
      <div
        class="mx-auto flex h-full flex-col items-center justify-between gap-12 p-8 lg:w-4xl lg:flex-row lg:gap-4 lg:p-0"
      >
        <div class="flex flex-col gap-6">
          <p>
            This is an unofficial leaderboard and is not affiliated with Fancy Cat Interactive or
            Iceberg Interactive.
          </p>
          <p>
            Leaderboard data is scraped from the official <a
              class="text-(--accent)"
              href="https://steamcommunity.com/stats/2504090/leaderboards/"
              >Heroes of Valor Steam leaderboards</a
            > on a hourly basis.
          </p>
        </div>
        <div class="flex flex-col gap-2 text-(--accent)">
          <a href="https://discord.com/invite/SQEYH4wJ7d">Heroes of Valor Discord</a>
          <a href="https://store.steampowered.com/app/2504090/Heroes_of_Valor/"
            >Heroes of Valor Steam</a
          >
          <a href="https://github.com/sij1nk/hov-player-ranking"> Source code</a>
        </div>
      </div>
    </footer>
  </div>
</div>
