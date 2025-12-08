import { Group, Select, Text } from "@mantine/core";

export default function BrowseActions(){
    return(
        <Group justify="space-between">
            <Group>
                <Text>Filter:</Text>
                <Select
                    placeholder="Sort option"
                    data={['Coming Soon', 'soon', 'soon 2', 'soon 3']}
                    defaultValue="React"
                    allowDeselect={true}
                />
            </Group>
            <Group>
                <Text>Sort:</Text>
                <Select
                    placeholder="Nearest"
                    data={['Nearest', 'Price: Low to high', 'Price: High to low', 'Recently added']}
                    defaultValue="Nearest"
                    allowDeselect={false}
                />
            </Group>
        </Group>
    )
}