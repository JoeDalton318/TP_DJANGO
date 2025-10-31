import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix pour les icônes Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const defaultCenter = [50.633, 3.0586] // Lille par défaut

export default function CompilationMap({ attractions }) {
  const points = (attractions || [])
    .map(a => ({
      id: a.id,
      name: a.name,
      lat: a.latitude != null ? Number(a.latitude) : null,
      lng: a.longitude != null ? Number(a.longitude) : null
    }))
    .filter(p => p.lat != null && p.lng != null)

  const center = points.length ? [points[0].lat, points[0].lng] : defaultCenter

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map(p => (
        <Marker key={p.id} position={[p.lat, p.lng]}>
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}