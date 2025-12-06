"use client";

import React from "react";
import { MediaRow, MediaRowData } from "./MediaRow";
import styles from "./MediaTable.module.css";

interface MediaTableProps {
  rows: MediaRowData[];
}

export function MediaTable({ rows }: MediaTableProps) {
  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Ads displayed</th>
              <th>Ads pending for approval</th>
              <th>Status</th>
              <th>Time until next update</th>
              <th>Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <MediaRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
      {/* TODO Make pagination dynamic and work based on amount of items (max 20 items per page) */}
      <div className={styles.pagination}>
        <button className={styles.pageBtn}>&larr;</button>
        <button className={`${styles.pageBtn} ${styles.current}`}>1</button>
        <button className={styles.pageBtn}>2</button>
        <button className={styles.pageBtn}>3</button>
        <span className={styles.ellipsis}>…</span>
        <button className={styles.pageBtn}>&rarr;</button>
      </div>
    </>
  );
}
