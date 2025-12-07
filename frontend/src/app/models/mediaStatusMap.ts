import { MediaStatuses } from "./mediaStatuses";

export const MediaStatusMap = {
  [MediaStatuses.PENDING]: {
    color: "yellow",
    text: "Pending",
  },
  [MediaStatuses.DISPLAYING]: {
    color: "blue",
    text: "Displaying",
  },
} as const;
