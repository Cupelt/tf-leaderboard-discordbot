

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
    leagueNumber: number;
    league: string;
    name: string;
    steamName: string;
    xboxName: string;
    psnName: string;
    cashouts: number;
}
  
export interface LeaderboardData {
    meta: Meta;
    count: number;
    data: UserData[];
}