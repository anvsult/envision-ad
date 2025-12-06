"use client";

import React from "react";
import { Header } from "@/components/Header/Header";
import styles from "./MediaOwnerDashboard.module.css";
import { MediaModal } from "@/components/Dashboard/MediaOwner/MediaModal/MediaModal";
import { MediaTable } from "@/components/Dashboard/MediaOwner/MediaTable/MediaTable";
import { useMediaList } from "@/components/Dashboard/MediaOwner/hooks/useMediaList";
import { useMediaForm } from "@/components/Dashboard/MediaOwner/hooks/useMediaForm";

export default function MediaOwnerPage() {
  const { media, loading, addNewMedia } = useMediaList();
  const { formState, updateField, updateDayTime, resetForm } = useMediaForm();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSave = async () => {
    try {
      await addNewMedia(formState);
      setIsModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    }
  };

  return (
    <div className={styles.pageRoot}>
      <Header />

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <ul className={styles.sideList}>
            <li className={styles.sideItem}>Overview</li>
            <li className={`${styles.sideItem} ${styles.active}`}>Media</li>
            <li className={styles.sideItem}>Displayed ads</li>
            <li className={styles.sideItem}>
              Ad requests <span className={styles.badge}>{media.length}</span>
            </li>
            <li className={styles.sideItem}>Transactions</li>
          </ul>
        </aside>

        <main className={styles.main}>
          <div className={styles.headerRow}>
            <button
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
            >
              Add new media
            </button>
          </div>

          <MediaModal
            opened={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            formState={formState}
            onFieldChange={updateField}
            onDayTimeChange={updateDayTime}
          />

          <MediaTable rows={media} />
        </main>
      </div>
    </div>
  );
}
