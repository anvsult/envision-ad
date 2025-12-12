import { Group, Select, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

interface BrowseActionsProps {
  filters?: React.ReactNode;
  sort?: React.ReactNode;
}

export function BrowseActions({ filters, sort }: BrowseActionsProps) {
  const t = useTranslations("browse.browseactions");
  return (
    <Group justify="space-between">
      <Group>
        <Text>{t("filter")}</Text>
        {filters}
      </Group>
      <Group>
        <Text>{t("sort")}</Text>
        {sort}
        <Select
          placeholder="Nearest"
          data={[
            "Nearest",
            "Price: Low to high",
            "Price: High to low",
            "Recently added",
          ]}
          defaultValue="Nearest"
          allowDeselect={false}
        />
      </Group>
    </Group>
  );
}

export default BrowseActions;
