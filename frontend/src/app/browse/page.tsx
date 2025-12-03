'use client';

import { Container, Title, Stack} from '@mantine/core';
import { NavBar } from '@/components/NavBar';
import '@mantine/carousel/styles.css';
import { Media } from '../models/media';
import  { MediaCardCarousel } from '@/components/CardCarousel';

const medias: Media[] = [
  {mediaId: '1', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #1', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '2', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #2', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '3', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #3', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '4', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #4', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '5', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #5', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},
  {mediaId: '6', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #6', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 300},

]

 function BrowsePage() {
  return (
    <>
      <NavBar />
      <Container size="xl" py={20} px={10}>
        <Stack gap="sm">
            <MediaCardCarousel title='Closest' medias={medias}/>
            <MediaCardCarousel title='Active Places' medias={medias}/>
            <MediaCardCarousel title='Recently Added' medias={medias}/>
        </Stack>
      </Container>
    </>
  );
}

export default BrowsePage;