import React from "react";
import styles from "./Footer.module.css";
import { useTranslations } from "next-intl";

export function Footer() {
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
            </ul>
          </div>

          {/* Social Media */}
          <div className={styles.section}>
            <h3 className={styles.heading}>{t("followUs")}</h3>
            <ul className={styles.list}>
              <li>
                <a
                  href="https://www.linkedin.com/company/visual-impact-lhamidi/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("linkedin")}
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/impactvisuel_/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("instagram")}
                </a>
              </li>
            </ul>
          </div>

          {/* Potentially to be implemented later */}
          {/* Legal Links */}
          {/* <div className={styles.section}>
            <h3 className={styles.heading}>{t("legal")}</h3>
            <ul className={styles.list}>
              <li>
                <a href="/terms">{t("terms")}</a>
              </li>
              <li>
                <a href="/privacy">{t("privacy")}</a>
              </li>
            </ul>
          </div> */}
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
