// types.ts

export interface Game {
    _id: string;
    title: string;
    bggLink: string;
    bggRating: number;
    ownerUsername?: string; // Optional if not all games will have this information
    communityName?: string; // Optional as well
  }
  