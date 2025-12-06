"use client";

import React from "react";
import styles from "./MediaTable.module.css";

export interface MediaRowData {
  id: string | number;
  name: string;
  image: string | null;
  adsDisplayed: number;
  pending: number;
  status: string;
  timeUntil: string;
  price: string;
}

interface MediaRowProps {
  row: MediaRowData;
}

export function MediaRow({ row }: MediaRowProps) {
  return (
    <tr className={styles.row}>
      <td>
        {row.image ? (
          <img src={row.image} alt={row.name} className={styles.thumb} />
        ) : (
          <div className={styles.thumb} />
        )}
      </td>
      <td>{row.name}</td>
      <td>{`${row.adsDisplayed} ads currently displayed`}</td>
      <td>{`${row.pending} pending for approval`}</td>
      <td>
        <span
          className={
            row.status === "Active"
              ? styles.statusActive
              : styles.statusInactive
          }
        >
          {row.status}
        </span>
      </td>
      <td>{row.timeUntil}</td>
      <td>{row.price}</td>
      <td className={styles.actions}>
        <button className={styles.iconBtn}>✎</button>
        <button className={styles.iconBtn}>🗑️</button>
      </td>
    </tr>
  );
}
