import { useState, useEffect } from "react";
import {
  addMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
} from "@/services/MediaService";
import type { MediaRowData } from "../MediaTable/MediaRow";
import type { MediaFormState } from "./useMediaForm";
import { MediaRequest } from "@/types/MediaTypes";

type MediaDetailsDTO = {
  id?: string;
  title: string;
  mediaOwnerName: string;
  typeOfDisplay: MediaRequest["typeOfDisplay"];
  loopDuration?: number | null;
  resolution?: string | null;
  aspectRatio?: string | null;
  width?: number | null;
  height?: number | null;
  price?: number | null;
  dailyImpressions?: number | null;
  schedule?: any;
  status?: MediaRequest["status"];
  mediaLocationId?: string | null;
  mediaLocation?: { id: string } | null;
  imageUrl?: string | null;
};

export function useMediaList() {
  const [media, setMedia] = useState<MediaRowData[]>([]);

  useEffect(() => {
    getAllMedia()
        .then((data) => {
          const items = (data || []).filter((m) => m.id != null);
          const mapped = items.map((m) => ({
            id: String(m.id),
            name: m.title,
            image: m.imageUrl ?? null,
            adsDisplayed: 0,
            pending: 0,
            status: m.status ?? "PENDING",
            timeUntil: "-",
            price: m.price ? `$${m.price}` : "$0",
          }));
          setMedia(mapped);
        })
        .catch((err) => {
          console.error("Failed to load media:", err);
        });
  }, []);

  const buildScheduleFromForm = (formState: MediaFormState) => {
    const selectedMonths = Object.keys(formState.activeMonths).filter(
        (m) => !!formState.activeMonths[m]
    );

    const weeklySchedule = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      dayOfWeek: day.toLowerCase(),
      isActive: !!formState.activeDaysOfWeek[day],
      startTime: formState.dailyOperatingHours[day]?.start ?? null,
      endTime: formState.dailyOperatingHours[day]?.end ?? null,
    }));

    return {
      selectedMonths,
      weeklySchedule,
    };
  };

  const addNewMedia = async (formState: MediaFormState) => {
    if (!formState.mediaTitle) {
      throw new Error("Please enter a media name");
    }

    const schedule = buildScheduleFromForm(formState);

    const payload: MediaRequest = {
      title: formState.mediaTitle,
      mediaOwnerName: formState.mediaOwnerName,
      mediaLocationId: formState.mediaLocationId,
      typeOfDisplay: formState.displayType,
      loopDuration: Number(formState.loopDuration),
      resolution: formState.resolution,
      aspectRatio: formState.aspectRatio,
      width: Number(formState.widthCm),
      height: Number(formState.heightCm),
      price: Number(formState.weeklyPrice),
      dailyImpressions: Number(formState.dailyImpressions),
      schedule: schedule,
      status: "PENDING",
    };

    try {
      const created = await addMedia(payload as MediaRequest);
      if (!created || created.id == null) {
        throw new Error("Created media did not return an id");
      }
      const newRow: MediaRowData = {
        id: String(created.id),
        name: formState.mediaTitle,
        image: created.imageUrl ?? null,
        adsDisplayed: 0,
        pending: 0,
        status: created.status ?? "PENDING",
        timeUntil: "-",
        price: formState.weeklyPrice || "$0",
      };
      setMedia((prev) => [newRow, ...prev]);
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error("Failed to save media: " + message);
    }
  };

  const editMedia = async (id: string | number, formState: MediaFormState) => {
    const schedule = buildScheduleFromForm(formState);

    const payload: MediaRequest = {
      title: formState.mediaTitle,
      mediaOwnerName: formState.mediaOwnerName,
      mediaLocationId: formState.mediaLocationId,
      resolution: formState.resolution,
      aspectRatio: formState.aspectRatio,
      loopDuration: Number(formState.loopDuration),
      width: Number(formState.widthCm),
      height: Number(formState.heightCm),
      price: Number(formState.weeklyPrice),
      dailyImpressions: Number(formState.dailyImpressions),
      schedule: schedule,
      status: "PENDING",
      typeOfDisplay: formState.displayType,
    };

    try {
      const updated = await updateMedia(String(id), payload as MediaRequest);
      setMedia((prev) =>
          prev.map((r) =>
              String(r.id) === String(id)
                  ? {
                    ...r,
                    name: updated.title,
                    image: updated.imageUrl ?? r.image,
                    status: updated.status ?? r.status,
                    price: updated.price ? `$${updated.price}` : r.price,
                  }
                  : r
          )
      );
      return updated;
    } catch (err: unknown) {
      console.error("Failed to update media:", err);
      throw err;
    }
  };

  const deleteMediaById = async (id: string | number) => {
    try {
      await deleteMedia(String(id));
      setMedia((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (err: unknown) {
      console.error("Failed to delete media:", err);
      throw err;
    }
  };

  const fetchMediaById = async (id: string | number) => {
    return getMediaById(String(id));
  };

  // Toggle status
  const toggleMediaStatus = async (id: string | number) => {
    const targetId = String(id);

    // find current row in UI
    const currentRow = media.find((m) => String(m.id) === targetId);
    if (!currentRow) return;

    if (currentRow.status === "PENDING" || currentRow.status === "REJECTED") {
      console.warn(
          "Cannot toggle status while media is pending approval or has been rejected"
      );
      return;
    }

    const currentStatus = currentRow.status;
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // optimistic UI update
    setMedia((prev) =>
        prev.map((m) => (String(m.id) === targetId ? { ...m, status: nextStatus } : m))
    );

    try {
      // Get backend details so updateMedia gets what it expects
      const backend = (await getMediaById(targetId)) as MediaDetailsDTO;

      const locationId = backend.mediaLocationId ?? backend.mediaLocation?.id;
      if (!locationId) {
        throw new Error(
            "Missing mediaLocationId from getMediaById() response (cannot update without location)"
        );
      }

      const payload: MediaRequest = {
        title: backend.title,
        mediaOwnerName: backend.mediaOwnerName,
        mediaLocationId: locationId,
        typeOfDisplay: backend.typeOfDisplay,

        loopDuration: backend.loopDuration ?? 0,
        resolution: backend.resolution ?? "",
        aspectRatio: backend.aspectRatio ?? "",
        width: backend.width ?? 0,
        height: backend.height ?? 0,
        price: backend.price ?? 0,
        dailyImpressions: backend.dailyImpressions ?? 0,

        schedule: backend.schedule,
        status: nextStatus,
      };


      const updated = await updateMedia(targetId, payload as MediaRequest);

      // Ensure local list matches whatever backend finally saved
      setMedia((prev) =>
          prev.map((m) =>
              String(m.id) === targetId
                  ? {
                    ...m,
                    status: updated.status ?? nextStatus,
                  }
                  : m
          )
      );

      return updated;
    } catch (err) {
      console.error("Failed to toggle media status:", err);

      // revert optimistic change on error
      setMedia((prev) =>
          prev.map((m) =>
              String(m.id) === targetId ? { ...m, status: currentStatus } : m
          )
      );
      throw err;
    }
  };

  return {
    media,
    addNewMedia,
    editMedia,
    deleteMediaById,
    fetchMediaById,
    toggleMediaStatus,
  };
}