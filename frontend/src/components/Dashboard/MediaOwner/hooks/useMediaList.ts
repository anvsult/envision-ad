import { useState, useEffect } from "react";
import { addMedia, getAllMedia, getMediaById, updateMedia, deleteMedia } from "@/services/MediaService";
import type { MediaRowData } from "../MediaTable/MediaRow";
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

    const daysObj: Record<string, { isActive: boolean; startTime: string | null; endTime: string | null }> = {
      monday:    { isActive: !!formState.activeDaysOfWeek["Monday"],    startTime: formState.dailyOperatingHours["Monday"]?.start ?? null,    endTime: formState.dailyOperatingHours["Monday"]?.end ?? null },
      tuesday:   { isActive: !!formState.activeDaysOfWeek["Tuesday"],   startTime: formState.dailyOperatingHours["Tuesday"]?.start ?? null,   endTime: formState.dailyOperatingHours["Tuesday"]?.end ?? null },
      wednesday: { isActive: !!formState.activeDaysOfWeek["Wednesday"], startTime: formState.dailyOperatingHours["Wednesday"]?.start ?? null, endTime: formState.dailyOperatingHours["Wednesday"]?.end ?? null },
      thursday:  { isActive: !!formState.activeDaysOfWeek["Thursday"],  startTime: formState.dailyOperatingHours["Thursday"]?.start ?? null,  endTime: formState.dailyOperatingHours["Thursday"]?.end ?? null },
      friday:    { isActive: !!formState.activeDaysOfWeek["Friday"],    startTime: formState.dailyOperatingHours["Friday"]?.start ?? null,    endTime: formState.dailyOperatingHours["Friday"]?.end ?? null },
      saturday:  { isActive: !!formState.activeDaysOfWeek["Saturday"],  startTime: formState.dailyOperatingHours["Saturday"]?.start ?? null,  endTime: formState.dailyOperatingHours["Saturday"]?.end ?? null },
      sunday:    { isActive: !!formState.activeDaysOfWeek["Sunday"],    startTime: formState.dailyOperatingHours["Sunday"]?.start ?? null,    endTime: formState.dailyOperatingHours["Sunday"]?.end ?? null },
    };

    return {
      selectedMonths,
      days: daysObj,
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
