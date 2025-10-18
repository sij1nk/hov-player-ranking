# Heroes of Valor player ranking

Website: <https://hov.sijink.xyz/>

This is a web app that lets you view Heroes of Valor leaderboard snapshots and player profiles.

## How it works

This project has a GitHub action that runs each hour and scrapes the data from the Heroes of Valor steam leaderboards:

- Total score: <https://steamcommunity.com/stats/2504090/leaderboards/16656646>
- PvP score: <https://steamcommunity.com/stats/2504090/leaderboards/16808192>

The scraped data (the leaderboard snapshot) is uploaded to a Supabase free tier postgres database.

The UI is a SvelteKit app, deployed to Cloudflare Workers.

## TODO

- testing
- better debugging capabilities
- prepare for scraping more leaderboards once they're available (kills, vehicle score, etc.)
- improve performance
