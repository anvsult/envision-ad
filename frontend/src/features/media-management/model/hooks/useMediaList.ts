import { useState, useEffect } from "react";
import { addMedia, getAllMedia, getMediaById, updateMedia, deleteMedia } from "@/entities/media/api";
import type { MediaRowData } from "@/widgets/media-dashboard/MediaTable/MediaRow";
import type { MediaFormState } from "./useMediaForm";

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
          status: m.status ?? "Pending",
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
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ].map(day => ({
      dayOfWeek: day.toLowerCase(),
      isActive: !!formState.activeDaysOfWeek[day],
      startTime: formState.dailyOperatingHours[day]?.start ?? null,
      endTime: formState.dailyOperatingHours[day]?.end ?? null
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

    const payload = {
      title: formState.mediaTitle,
      mediaOwnerName: formState.mediaOwnerName,
      address: formState.mediaAddress,
      resolution: formState.resolution,
      aspectRatio: formState.aspectRatio,
      loopDuration: formState.loopDuration ? Number(formState.loopDuration) : null,
      width: formState.widthCm ? Number(formState.widthCm) : null,
      height: formState.heightCm ? Number(formState.heightCm) : null,
      price: formState.weeklyPrice ? Number(formState.weeklyPrice) : null,
      dailyImpressions: formState.dailyImpressions ? Number(formState.dailyImpressions) : null,
      schedule: schedule,
      status: null,
      typeOfDisplay: formState.displayType,
    };

    try {
      const created = await addMedia(payload as any);
      if (!created || created.id == null) {
        throw new Error('Created media did not return an id');
      }
      const newRow: MediaRowData = {
        id: String(created.id),
        name: formState.mediaTitle,
        image: created.imageUrl ?? null,
        adsDisplayed: 0,
        pending: 0,
        status: created.status ?? "Pending Admin Approval",
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

    const payload = {
      title: formState.mediaTitle,
      mediaOwnerName: formState.mediaOwnerName,
      address: formState.mediaAddress,
      resolution: formState.resolution,
      aspectRatio: formState.aspectRatio,
      loopDuration: formState.loopDuration ? Number(formState.loopDuration) : null,
      width: formState.widthCm ? Number(formState.widthCm) : null,
      height: formState.heightCm ? Number(formState.heightCm) : null,
      price: formState.weeklyPrice ? Number(formState.weeklyPrice) : null,
      dailyImpressions: formState.dailyImpressions ? Number(formState.dailyImpressions) : null,
      schedule: schedule,
      status: null,
      typeOfDisplay: formState.displayType,
    };

    try {
      const updated = await updateMedia(String(id), payload as any);
      setMedia((prev) =>
        prev.map((r) => (String(r.id) === String(id) ? { ...r, name: updated.title, image: updated.imageUrl ?? r.image, status: updated.status ?? r.status, price: updated.price ? `$${updated.price}` : r.price } : r))
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

  return {
    media,
    addNewMedia,
    editMedia,
    deleteMediaById,
    fetchMediaById,
  };
}
