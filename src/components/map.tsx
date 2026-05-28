import {TileLayer} from "react-leaflet/TileLayer";
import {Marker} from "react-leaflet";
import {Icon} from "leaflet";
import {MapContainer} from "react-leaflet/MapContainer";
import {Button} from "@nextui-org/button";
import {Link} from "@nextui-org/link";
import {useLanguage} from "@/contexts/LanguageContext";

export default function Map() {
  const position: any = [54.452847, 18.402047];
  const marker: string = "/icons/marker.svg";
  const { data } = useLanguage();
  const contact = data.contact;
  return (
    <MapContainer center={position} zoom={12} className="md:rounded-l-lg max-md:h-[300px] z-10 flex">
      <Button className="z-[400] m-2 self-end" style={{color: "white"}} target="_blank" as={Link} href="https://maps.app.goo.gl/YNLTg4gsVhSLC4FT6" id="wskazowki-dojazdu">{contact?.howGet}</Button>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      <Marker position={position} icon={new Icon({iconUrl: marker, iconSize: [32, 32], iconAnchor: [12, 41]})}>
      </Marker>
    </MapContainer>
  );
}