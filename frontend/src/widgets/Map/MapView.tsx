import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import {  Paper } from '@mantine/core';
import 'leaflet/dist/leaflet.css';
import { LatLngLiteral } from 'leaflet';

interface MapViewProps {
    center: LatLngLiteral;
    markers?: LatLngLiteral[];
}

export default function MapView({center, markers}: MapViewProps){

    return(
        <Paper w="100%" h="100vh" radius="lg" style={{overflow: "hidden"}}>
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{height:"100%", width:"100%"}}>
                <TileLayer
                    
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    
                />
                {/* <Marker position={center}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker> */}
                
            </MapContainer>
        </Paper>
    )

}