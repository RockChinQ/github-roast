import { getTranslations } from "next-intl/server";
import { getHeatLeaderboard, getLeaderboard } from "@/lib/db";
import { HomeLeaderboardClient, type HomeLeaderboardLabels } from "./HomeLeaderboardClient";
import type { LeaderboardLabels } from "./LeaderboardClient";

export async function HomeLeaderboard({ pageSize = 10 }: { pageSize?: number }) {
  const tHome = await getTranslations("home");
  const tBoard = await getTranslations("leaderboard");
  const leaderboardLabels: LeaderboardLabels = {
    empty: tBoard("empty"),
    prev: tBoard("prev"),
    next: tBoard("next"),
    collapse: tBoard("collapse"),
    viewDetail: tBoard("viewDetail", { username: "{username}" }),
    heatLabel: tBoard("heatLabel"),
    heatTitle: tBoard("heatTitle"),
  };
  const labels: HomeLeaderboardLabels = {
    heading: tHome("boardHeading"),
    openBoard: tHome("openBoard"),
    scoreView: tBoard("scoreView"),
    heatView: tBoard("heatView"),
  };

  const [scoreEntries, heatEntries] = await Promise.all([
    getLeaderboard(500),
    getHeatLeaderboard(500),
  ]);

  return (
    <HomeLeaderboardClient
      labels={labels}
      leaderboardLabels={leaderboardLabels}
      pageSize={pageSize}
      scoreEntries={scoreEntries}
      heatEntries={heatEntries}
    />
  );
}
