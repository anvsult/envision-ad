"use client";

import React from "react";
import styles from "./Footer.module.css";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Contact Information */}
          <div className={styles.section}>
            <h3 className={styles.heading}>{t("contactUs")}</h3>
            <ul className={styles.list}>
              <li>{t("email")}</li>
              <li>{t("phone")}</li>
              <li>{t("address")}</li>
            </ul>
          </div>

          {/* Social Media */}
          <div className={styles.section}>
            <h3 className={styles.heading}>{t("followUs")}</h3>
            <ul className={styles.list}>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("twitter")}
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("facebook")}
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("linkedin")}
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("instagram")}
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className={styles.section}>
            <h3 className={styles.heading}>{t("legal")}</h3>
            <ul className={styles.list}>
              <li>
                <a href="/terms">{t("terms")}</a>
              </li>
              <li>
                <a href="/privacy">{t("privacy")}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
