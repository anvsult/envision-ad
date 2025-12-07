'use client'

import { Container, Pagination, Stack } from '@mantine/core';
import { Header } from "@/components/Header/Header";
import '@mantine/carousel/styles.css';
import { Media } from '@/app/models/media';
import { MediaCardGrid } from '@/components/Grid/CardGrid';
import BrowseActions from '@/components/BrowseActions/BrowseActions';
import { useMemo, useState } from 'react';


const baseMedias: Media[] = [
  { mediaId: '1', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #1', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 40, impressions: 300, dateAdded: new Date("2024-12-20 08:00") },
  { mediaId: '2', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #2', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 10, impressions: 100, dateAdded: new Date("2025-12-21 08:00") },
  { mediaId: '3', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #3', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 30, impressions: 160, dateAdded: new Date("2025-12-22 08:00") },
  { mediaId: '4', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #4', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, impressions: 20, dateAdded: new Date("2024-12-20 08:00") },
  { mediaId: '5', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #5', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 30, impressions: 50, dateAdded: new Date("2025-12-20 08:05") },
  { mediaId: '6', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #6', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 20, impressions: 30, dateAdded: new Date("2025-11-23 08:00") },
  { mediaId: '7', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #7', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 5, impressions: 60, dateAdded: new Date("2025-10-23 08:00") },
  { mediaId: '8', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #8', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 30, impressions: 10, dateAdded: new Date("2022-12-23 08:00") },
  { mediaId: '9', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #9', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 20, impressions: 40, dateAdded: new Date("2023-12-23 08:40") },
  { mediaId: '10', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #10', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 10, impressions: 10, dateAdded: new Date("2025-12-23 08:30") },
  { mediaId: '11', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #11', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 20, impressions: 20, dateAdded: new Date("2025-11-23 08:00") },
];


function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const generatedMedias: Media[] = Array.from({ length: 80 }, (_, i) => ({
  mediaId: (baseMedias.length + i + 1).toString(),
  image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png',
  title: `Random Screen #${i + 12}`,
  mediaOwner: randomFrom(['Mohamed Lhamidi', 'Alex Tremblay', 'Sarah Nguyen']),
  address: randomFrom(['Montreal', 'Longueuil', 'Brossard']),
  ratio: '16:9',
  width: 1920,
  height: 1080,
  type: 'Digital',
  price: Math.floor(Math.random() * 50) + 5,
  impressions: Math.floor(Math.random() * 500) + 10,
  dateAdded: randomDate(new Date(2022, 0, 1), new Date(2025, 11, 31)),
}));

const allMedias: Media[] = [...baseMedias, ...generatedMedias];


function BrowsePage() {
  const maxMediaPerPage = 32;
  const [activePage, setActivePage] = useState(1);

  const totalPages = Math.ceil(allMedias.length / maxMediaPerPage);

  const paginatedMedias = useMemo(() => {
    const start = (activePage - 1) * maxMediaPerPage;
    const end = start + maxMediaPerPage;
    return allMedias.slice(start, end);
  }, [activePage]);

  return (
    <>
      <Header />

      <Container size="xl" py={20} px={80}>
        <Stack gap="sm">
          <BrowseActions />

          <MediaCardGrid medias={paginatedMedias} />

          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setActivePage}
            mt="md"
          />
        </Stack>
      </Container>
    </>
  );
}

export default BrowsePage;
