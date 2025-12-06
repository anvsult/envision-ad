import { Container, Stack} from '@mantine/core';
import { Header } from "@/components/Header/Header";
import '@mantine/carousel/styles.css';
import { Media } from '@/app/models/media';
import  { MediaCardCarousel } from '@/components/CardCarousel';



function BrowsePage() {
  const maxCarouselSize = 6
  const medias: Media[] = [
    {mediaId: '1', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #1', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 40, passerbys: 300, dateAdded: new Date("2024-12-20 08:00")},
    {mediaId: '2', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #2', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 10, passerbys: 100, dateAdded: new Date("2025-12-21 08:00")},
    {mediaId: '3', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #3', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 30, passerbys: 160, dateAdded: new Date("2025-12-22 08:00")},
    {mediaId: '4', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #4', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 50, passerbys: 20, dateAdded: new Date("2024-12-20 08:00")},
    {mediaId: '5', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #5', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 30, passerbys: 50, dateAdded: new Date("2025-12-20 08:05")},
    {mediaId: '6', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #6', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 20, passerbys: 30, dateAdded: new Date("2025-11-23 08:00")},
    {mediaId: '7', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #7', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 5, passerbys: 60, dateAdded: new Date("2025-10-23 08:00")},
    {mediaId: '8', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #8', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 30, passerbys: 10, dateAdded: new Date("2022-12-23 08:00")},
    {mediaId: '9', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #9', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 20, passerbys: 40, dateAdded: new Date("2023-12-23 08:40")},
    {mediaId: '10', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #10', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 10, passerbys: 10, dateAdded: new Date("2025-12-23 08:30")},
    {mediaId: '11', image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png', title: 'Champlain College Screen #11', mediaOwner: 'Mohamed Lhamidi', address: '900 Rue Riverside, Saint-Lambert, QC J4P 3P2', ratio: '16:9', width: 1920, height: 1080, type: 'Digital', price: 20, passerbys: 20, dateAdded: new Date("2025-11-23 08:00")},
  ]


  const sortedByPasserbys = [...medias].sort((a, b) => b.passerbys - a.passerbys).slice(0, maxCarouselSize);
  const sortedByDate = [...medias].sort((a, b) => b.dateAdded.valueOf() - a.dateAdded.valueOf()).slice(0, maxCarouselSize);
  const sortedByPrice = [...medias].sort((a, b) => b.price - a.price).slice(0, maxCarouselSize);

  return (
  <>
    <Header />
    <Container size="xl" py={20} px={10}>
      <Stack gap="sm" >
          {/* <MediaCardCarousel title='Closest' medias={medias}/> */}
          <MediaCardCarousel title='Active Places' medias={sortedByPasserbys}/>
          <MediaCardCarousel title='Best Deals' medias={sortedByPrice}/>
          <MediaCardCarousel title='Recently Added' medias={sortedByDate}/>
      </Stack>
    </Container>
  </>
);
}

export default BrowsePage;
