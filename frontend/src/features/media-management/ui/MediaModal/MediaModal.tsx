"use client";

import { Modal, Button, ScrollArea } from "@mantine/core";
import { MediaDetailsForm } from "./MediaDetailsForm";
import { ScheduleSelector } from "./ScheduleSelector";
import type { MediaFormState } from "../../model/hooks/useMediaForm";

// Why do we need this?
interface MediaModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: () => void;
  formState: MediaFormState;
  onFieldChange: <K extends keyof MediaFormState>(
    field: K,
    value: MediaFormState[K]
  ) => void;
  onDayTimeChange: (day: string, part: "start" | "end", value: string) => void;
}

export function MediaModal({
  opened,
  onClose,
  onSave,
  formState,
  onFieldChange,
  onDayTimeChange,
}: MediaModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Publish Media"
      size="lg"
      centered
      overlayProps={{ opacity: 0.55 }}
    >
      <ScrollArea style={{ height: 420 }}>
        <div style={{ paddingRight: 8 }}>
          <MediaDetailsForm
            formState={formState}
            onFieldChange={onFieldChange}
          />

          <ScheduleSelector
            formState={formState}
            onFieldChange={onFieldChange}
            onDayTimeChange={onDayTimeChange}
          />
        </div>
      </ScrollArea>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 12,
        }}
      >
        <Button variant="default" onClick={onClose} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </Modal>
  );
}
