import { MediaStatuses } from "@/app/models/mediaStatuses";
import { MediaStatusMap } from "@/app/models/mediaStatusMap";
import { Badge } from "@mantine/core";

interface MediaStatusProps {
    status: MediaStatuses;
}

export default function StatusBadge({status}: MediaStatusProps){

    return(
        <Badge color={MediaStatusMap[status].color} 
            pos="absolute" 
            top={10}
            left={10}
            style={{ zIndex: 1 }}
        >
            {MediaStatusMap[status].text}
        </Badge>
    )
}