import { ReservationStatus } from "@/entities/reservation";
import type { MediaLocation } from "@/entities/media-location";
import type {
  DateRangeMap,
  MediaScreenTimelineRow,
  OverviewPeriod,
  ReservationResponseDTO,
} from "@/pages/dashboard/media-owner/ui/metrics-dashboard/types";
import { parseDateMs } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/shared-utils";
import { resolveDateRange, mediaLegendColors } from "@/pages/dashboard/media-owner/ui/metrics-dashboard/overview-utils";

export const buildMediaScreensTimelineData = (
  reservations: ReservationResponseDTO[],
  location: MediaLocation | undefined,
  period: OverviewPeriod,
  dateRange?: DateRangeMap
): { rows: MediaScreenTimelineRow[]; startMs: number; endMs: number } => {
  if (!location || !location.mediaList || location.mediaList.length === 0) {
    return { rows: [], startMs: 0, endMs: 0 };
  }

  const [startBoundMs, endBoundMs] = resolveDateRange(period, dateRange);

  const rows: MediaScreenTimelineRow[] = location.mediaList.map((media, idx) => ({
    mediaId: media.id ?? `unknown-${idx}`,
    mediaName: media.title,
    color: mediaLegendColors[idx % mediaLegendColors.length],
    segments: [],
  }));

  const mediaList = location.mediaList;

  // Filter reservations down to only confirmed ones linked to the current location 
  const locationReservations = reservations.filter(
    (r) => r.status === ReservationStatus.CONFIRMED && mediaList.some((m) => m.id === r.mediaId)
  );

  locationReservations.forEach((reservation) => {
    const resStartMs = parseDateMs(reservation.startDate);
    const resEndMs = parseDateMs(reservation.endDate);

    if (resStartMs === null || resEndMs === null) return;

    // Check if reservation overlaps with the selected viewing period bounds
    if (resEndMs <= startBoundMs || resStartMs >= endBoundMs) return;

    const rowIndex = rows.findIndex((r) => r.mediaId === reservation.mediaId);
    if (rowIndex !== -1) {
      // Trim segment bounds to fit within the visible timeline axis
      const visibleStartMs = Math.max(resStartMs, startBoundMs);
      const visibleEndMs = Math.min(resEndMs, endBoundMs);

      rows[rowIndex].segments.push({
        id: reservation.reservationId,
        startDateMs: visibleStartMs,
        endDateMs: visibleEndMs,
      });
    }
  });

  return { rows, startMs: startBoundMs, endMs: endBoundMs };
};
