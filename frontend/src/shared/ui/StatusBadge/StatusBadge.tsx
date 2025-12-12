import { MediaAdStatuses, MediaAdStatusMap } from "@/entities/media";
import { Badge } from "@mantine/core";

interface MediaStatusProps {
  status: MediaAdStatuses;
}

export function StatusBadge({ status }: MediaStatusProps) {
  return (
    <Badge
      color={MediaAdStatusMap[status].color}
      pos="absolute"
      top={10}
      left={10}
      style={{ zIndex: 1 }}
    >
      {MediaAdStatusMap[status].text}
    </Badge>
  );
}

export default StatusBadge;
