'use client';

import { Container, Title, Text, Stack} from '@mantine/core';
import { Carousel, CarouselSlide } from '@mantine/carousel';
import { NavBar } from '@/components/NavBar';
import '@mantine/carousel/styles.css';
import MediaCard from '@/components/MediaCard';
import { Media } from '../models/media';

const medias: Media[] = [
  {mediaId: '1', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'title', mediaOwner: 'hi', address: 'hi', ratio: 'hi', size: 'hi', type: 'hi', price: 'hi', passerbys: 'hi'},
  {mediaId: '2', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'title', mediaOwner: 'hi', address: 'hi', ratio: 'hi', size: 'hi', type: 'hi', price: 'hi', passerbys: 'hi'},
  {mediaId: '3', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'title', mediaOwner: 'hi', address: 'hi', ratio: 'hi', size: 'hi', type: 'hi', price: 'hi', passerbys: 'hi'},
  {mediaId: '4', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'title', mediaOwner: 'hi', address: 'hi', ratio: 'hi', size: 'hi', type: 'hi', price: 'hi', passerbys: 'hi'},
]

 function BrowsePage() {
  return (
    <>
      <NavBar />
      <Container size="xl" py={20} px={10}>
        <Stack gap="xl">
          <Title order={1} size="h1" fw={700}>
            Browse Ad Spaces
          </Title>
          
            <Carousel withIndicators
                      height={600}
                      slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
                      slideGap={{ base: 0, sm: 'md' }}
                      emblaOptions={{ loop: true, align: 'start' }}
                      py={10}
                      px={10}>
              {medias.map((media) => (
                <CarouselSlide key={media.mediaId} >
                  <MediaCard  
                              image={media.image} 
                              title={media.title} 
                              mediaOwner={media.mediaOwner} 
                              address={media.address} 
                              ratio={media.ratio} 
                              size={media.size} 
                              type={media.type} 
                              price={media.price} 
                              passerbys={media.passerbys}/>
                </CarouselSlide>
              ))}
            </Carousel>
        </Stack>
      </Container>
    </>
  );
}

export default BrowsePage;