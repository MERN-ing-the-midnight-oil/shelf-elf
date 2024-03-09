
// src/types.ts

  export interface Game {
    gameIdentification: string;
    _id: string;
    gameTitle: string;
    bggLink: string;
    ownerUsername: string;
    communityName: string;
    bggRating: number;
    thumbnailUrl?: string;
}



export interface SharedComponentProps {
  token: string;
  setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
  refetchCounter: number;
}