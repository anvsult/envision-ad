'use client';

import { Container, Title, Stack} from '@mantine/core';
import { CarouselSlide } from '@mantine/carousel';
import { NavBar } from '@/components/NavBar';
import '@mantine/carousel/styles.css';
import MediaCard from '@/components/MediaCard';
import { Media } from '../models/media';
import CardCarousel, { MediaCardCarousel } from '@/components/CardCarousel';

const medias: Media[] = [
  {mediaId: '1', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #1', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '2', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #2', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '3', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #3', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '4', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #4', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '5', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #5', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},

]

 function BrowsePage() {
  return (
    <>
      <NavBar />
      <Container size="xl" py={20} px={10}>
        <Stack gap="sm">
          <Title order={1} size="h1" fw={700}>
            Browse Ad Spaces
          </Title>
            <MediaCardCarousel title='Closest' medias={medias}/>
        </Stack>
      </Container>
    </>
  );
}

export default BrowsePage;