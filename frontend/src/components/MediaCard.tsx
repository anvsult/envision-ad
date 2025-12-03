import { Paper, Text, Image, Title, Space, Anchor } from "@mantine/core";
import styles from "./MediaCard.module.css";
import { Media } from "@/app/models/media";



function MediaCard({image, title, mediaOwner, address, ratio, width, height, type, price, passerbys}: Media) {
    return (
        <Anchor href="/browse" style={{ textDecoration: 'none', color: 'black' }}>
            <Paper 
                shadow="sm"
                radius="md"
            >
                <Image src={image} alt="Media" radius="md" />
                <div className={styles.details}>
                    
                    <Title order={5} >
                        {title}
                    </Title>
                    <Text size="md" >
                        {mediaOwner}
                    </Text>
                    <Text size="xs">
                        {address}
                    </Text>

                    <div className={styles.info}>    
                        <Text size="xs" span>
                            {ratio}
                        </Text>
                        <Space w="lg" />
                        <Text size="xs" span>
                            {width}x{height} 
                        </Text>
                        <Space w="lg" />
                        <Text size="xs" span>
                            {type}
                        </Text>
                        <Text size="xs" span>
                            ${price} per week
                        </Text>
                        <Space w="lg" />
                        <Text size="xs" span>
                            ~{passerbys} daily passerbys
                        </Text>
                    </div>
                </div>
            </Paper>
        </Anchor>
    )
}

export default MediaCard;