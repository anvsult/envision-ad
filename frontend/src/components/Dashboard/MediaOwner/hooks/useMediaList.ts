import { useState, useEffect } from "react";
import { addMedia, getAllMedia } from "@/services/MediaService";
import type { MediaRowData } from "../MediaTable/MediaRow";
import type { MediaFormState } from "./useMediaForm";

export function useMediaList() {
  const [media, setMedia] = useState<MediaRowData[]>([]);

  useEffect(() => {
    getAllMedia()
      .then((data) => {
        const mapped = (data || []).map((m) => ({
          id: m.id,
          name: m.title,
          image: m.imageUrl ?? null,
          adsDisplayed: 0,
          pending: 0,
          status: m.status ?? "Pending Admin Approval",
          timeUntil: "-",
          price: m.price
            ? typeof m.price === "number"
              ? `$${m.price}`
              : String(m.price)
            : "$0",
        }));
        setMedia(mapped);
      })
      .catch((err) => {
        console.error("Failed to load media:", err);
      });
  }, []);

  const addNewMedia = async (formState: MediaFormState) => {
    if (!formState.mediaTitle) {
      throw new Error("Please enter a media name");
    }

    const selectedMonthsArray = Object.keys(formState.activeMonths).filter(
      (m) => !!formState.activeMonths[m]
    );

    const weekOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const weeklySchedule = weekOrder.map((d) => {
      const isActive = !!formState.activeDaysOfWeek[d];
      return {
        dayOfWeek: d,
        isActive,
        startTime: isActive ? formState.dailyOperatingHours[d]?.start ?? null : null,
        endTime: isActive ? formState.dailyOperatingHours[d]?.end ?? null : null,
      };
    });

    const scheduleObj = {
      selectedMonths: selectedMonthsArray,
      weeklySchedule,
    };

    const payload = {
      title: formState.mediaTitle,
      mediaOwnerName: formState.mediaOwnerName,
      address: formState.mediaAddress,
      resolution: formState.resolution,
      aspectRatio: formState.aspectRatio,
      loopDuration: formState.loopDuration ? Number(formState.loopDuration) : null,
      width: formState.widthCm ? Number(formState.widthCm) : null,
      height: formState.heightCm ? Number(formState.heightCm) : null,
      price: formState.weeklyPrice ? formState.weeklyPrice : null,
      schedule: scheduleObj,
      status: null,
      typeOfDisplay: formState.displayType,
    };

    try {
      const created = await addMedia(payload);
      const newRow: MediaRowData = {
        id: created.id,
        name: formState.mediaTitle,
        image: created.imageUrl ?? null,
        adsDisplayed: 0,
        pending: 0,
        status: created.status ?? "Pending Admin Approval",
        timeUntil: "-",
        price: formState.weeklyPrice || "$0",
      };
      setMedia((prev) => [newRow, ...prev]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error("Failed to save media: " + message);
    }
  };

  return {
    media,
    addNewMedia,
  };
}
