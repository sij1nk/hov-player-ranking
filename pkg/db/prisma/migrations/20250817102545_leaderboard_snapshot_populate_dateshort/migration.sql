-- populate dateShort with 'YYYY-MM-DD-hh'
update leaderboard_snapshots set "dateShort" = (
  format('%s-%s-%s-%s',
    extract(year from date),
    to_char(extract(month from date), 'fm00'),
    to_char(extract(day from date), 'fm00'),
    to_char(extract(hour from date), 'fm00')
  )
);

-- "dateShort" is going to be a unique column, so 
-- we're deleting all duplicates and keeping the latest only

-- delete player stats first for the snapshots to be deleted
with snapshots_to_delete as (
  select id from leaderboard_snapshots ou
  where ou.date < (
    select date from leaderboard_snapshots inr
    where inr."dateShort" = ou."dateShort"
    order by date desc
    limit 1
  )
)
delete from player_stats s
where s."snapshotId" in (select * from snapshots_to_delete);

-- ...then delete the snapshots
with snapshots_to_delete as (
  select id from leaderboard_snapshots ou
  where ou.date < (
    select date from leaderboard_snapshots inr
    where inr."dateShort" = ou."dateShort"
    order by date desc
    limit 1
  )
)
delete from leaderboard_snapshots s
where s.id in (select * from snapshots_to_delete);
