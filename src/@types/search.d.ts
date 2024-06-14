

export interface LeaderboardMeta {
    leaderboardVersion: string;
    leaderboardPlatform: string;
    nameFilter: string;
    returnRawData: boolean;
    returnCountOnly: boolean;
}
  
export interface UserData {
    rank: number;
    change: number;
    name: string;
    steamName: string;
    xboxName: string;
    psnName: string;
    leagueNumber: number;
    league: string
    rankScore: number;
}
  
export interface LeaderboardData {
    meta: Meta;
    count: number;
    data: UserData[];
}