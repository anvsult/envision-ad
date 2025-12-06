import { Title, Text } from "@mantine/core";
import classes from "./Partners.module.css";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function Partners() {
  const t = useTranslations("partners");

  const partners = [
    {
      key: "visualImpact",
      logo: "/images/logo-visual-impact.png",
    },
    {
      key: "champlainCollege",
      logo: "/images/logo-champlain-college.png",
    },
    {
      key: "salonLola",
      logo: "/images/logo-salon-lola.png",
    },
    {
      key: "bazGym",
      logo: "/images/logo-baz-gym.jpg",
    },
    {
      key: "entrepotEnFolie",
      logo: "/images/logo-entrepot-en-folie.png",
    },
    {
      key: "infiniteBarbershop",
      logo: "/images/logo-infinite-barbershop.png",
    },
    {
      key: "liquidationMarie",
      logo: "/images/logo-liquidation-marie.png",
    },
    {
      key: "pingMo",
      logo: "/images/logo-ping-mo.png",
    },
  ];

  const totalItems = partners.length;
  const animationDuration = 30;

  return (
    <div className={classes.partnersSection}>
      <Title size="h1" fw={700} className={classes.title}>
        {t("title")}
      </Title>

      <div className={classes.scrollContainer}>
        {partners.map((partner, index) => (
          <div
            key={index}
            className={classes.partnerLogo}
            style={{
              animationDelay: `calc(${animationDuration}s / ${totalItems} * (${totalItems} - ${
                index + 1
              }) * -1)`,
            }}
          >
            <div className={classes.logoImageWrapper}>
              <Image
                src={partner.logo}
                alt={t(`${partner.key}.alt`)}
                width={150}
                height={150}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <Text size="xl" fw={700} c="grey" mt="lg">
              {t(`${partner.key}.name`)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
