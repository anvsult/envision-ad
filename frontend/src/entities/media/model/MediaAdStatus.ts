export enum MediaAdStatuses {
  PENDING = "PENDING",
  DISPLAYING = "DISPLAYING",
}

export const MediaAdStatusMap = {
  [MediaAdStatuses.PENDING]: {
    color: "yellow",
    text: "Pending",
  },
  [MediaAdStatuses.DISPLAYING]: {
    color: "blue",
    text: "Displaying",
  },
} as const;
