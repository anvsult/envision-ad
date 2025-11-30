import { Paper, Text, Image, Title } from "@mantine/core";

interface MediaCardProps {
    image: string;
    title: string;
    mediaOwner: string,
    address: string,
    ratio: string,
    size: string,
    type: string,
    price: string,
    passerbys: string
}

function MediaCard({image, title, mediaOwner, address, ratio, size, type, price, passerbys}: MediaCardProps) {
    return (
        <Paper 
            shadow="sm"
            p="xl"
            radius="md"
            >
                <div>
        <Image src={image} alt="Media"/>
        <Title order={3} >
          {title}
        </Title>
        <Text  size="xs">
          {mediaOwner}
        </Text>
        <Text  size="xs">
          {address}
        </Text>
        <Text  size="xs">
          {ratio}
        </Text>
        <Text  size="xs">
          {size}
        </Text>
        <Text  size="xs">
          {type}
        </Text>
        <Text  size="xs">
          {price}
        </Text>
        <Text  size="xs">
          {passerbys}
        </Text>
        
      </div>
        </Paper>
    )
}

export default MediaCard;