import {TileLayer} from "react-leaflet/TileLayer";
import {Marker} from "react-leaflet";
import {Icon} from "leaflet";
import {MapContainer} from "react-leaflet/MapContainer";

export default function Map() {
  const position: any = [54.452847, 18.402047];
  const marker: string = "/icons/marker.svg";
  return (
    <MapContainer center={position} zoom={12}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      <Marker position={position} icon={new Icon({iconUrl: marker, iconSize: [32, 32], iconAnchor: [12, 41]})}>
      </Marker>
    </MapContainer>
  );
}