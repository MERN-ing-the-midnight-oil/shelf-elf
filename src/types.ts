
// src/types.ts
interface UserRequest {
  username: string;
  // Add other relevant properties here
}
interface Message {
  sender: string; // Use this line if you're only dealing with usernames
  messageText: string;
  createdAt: Date;
}



  export interface Game {
    gameIdentification: string;
    _id: string;
    gameTitle: string;
    bggLink: string;
    ownerUsername: string;
    communityName: string;
    bggRating: number;
    thumbnailUrl?: string;
    title: string
    status: string;
    requests: UserRequest[];
    messages: Message[];
  }



export interface SharedComponentProps {
  token: string;
  setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
  refetchCounter: number;
}

