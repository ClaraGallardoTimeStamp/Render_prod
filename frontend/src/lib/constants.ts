export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
    "accessible_poi": "Punto de Interés Accesible", "alojamientos": "Alojamientos",
    "archeological_site": "Sitio Arqueológico", "atm": "Cajero Automático",
    "audio_guide": "Audioguía", "beach": "Playa", "bike_lane": "Carril Bici",
    "bridge": "Puente", "castle": "Castillo", "church": "Iglesia",
    "complementary_activities_company": "Actividades Complementarias",
    "destination_experience": "Experiencia en Destino", "educational_centre": "Centro Educativo",
    "equestrian_club": "Club Hípico", "event": "Evento", "fire_station": "Estación de Bomberos",
    "garden": "Jardín", "gas_station": "Gasolinera",
    "historical_or_cultural_resource": "Recurso Histórico o Cultural", "image_360": "Imagen 360",
    "leisure_and_culture_facility": "Instalación de Ocio y Cultura", "medical_service": "Servicio Médico",
    "miscellaneous_service": "Servicios Misceláneos", "monument": "Monumento",
    "municipio_ref": "Referencia de Municipio", "museum": "Museo", "natural_park": "Parque Natural",
    "natural_view_point": "Mirador Natural", "offer": "Oferta", "pamphlet": "Folleto",
    "pharmacy": "Farmacia", "photography": "Fotografía", "police_station": "Comisaría de Policía",
    "primary_care": "Atención Primaria", "restaurantes": "Restaurantes", "route": "Ruta",
    "shopping_mall": "Centro Comercial", "sport_facility": "Instalación Deportiva",
    "supermarket": "Supermercado", "tour_guide": "Guía Turístico",
    "tourism_destination": "Destino Turístico", "tourist_attraction_site": "Atracción Turística",
    "tourist_information_office": "Oficina de Turismo", "town_hall": "Ayuntamiento",
    "traditional_market": "Mercado Tradicional", "trail": "Sendero",
    "travel_agency": "Agencia de Viajes", "trivia_question": "Pregunta de Trivial",
    "vehicle_experience": "Experiencia en Vehículo", "vehicle_workshop": "Taller de Vehículos",
    "vernacular_architecture": "Arquitectura Vernácula", "video_360": "Video 360",
    "video_media": "Medio de Video", "virtual_visit": "Visita Virtual",
    "wifi_point": "Punto WiFi", "winery": "Bodega"
};

export const EXCLUDED_FIELDS = [
    'id', 'palabras_clave', 'uri_clase', 'estado_publicacion', 'url_web', 'app',
    'accessibility_level', 'accessibility_description', 'uri_segittur', 'fecha_creacion',
    'fecha_actualizacion', 'drupal_nid', 'nivel_1', 'nivel_2', 'nivel_3', 'nivel_4', 'nivel_5',
    'auditoria_estado', 'usuario_auditor'
].map(f => f.toLowerCase());

export const getSolidColor = (percent: number, isDark: boolean): string => {
    if (percent <= 30) return isDark ? '#f87171' : '#dc2626';
    if (percent >= 100) return isDark ? '#34d399' : '#059669';
    const hue = ((percent - 30) / 70) * 120;
    return `hsl(${hue}, ${isDark ? '40%' : '50%'}, ${isDark ? '55%' : '45%'})`;
};

export const getPastelColor = (percent: number, isDark: boolean): string => {
    if (percent <= 30) return isDark ? 'rgba(248,113,113,0.08)' : 'rgba(220,38,38,0.04)';
    if (percent >= 100) return isDark ? 'rgba(52,211,153,0.08)' : 'rgba(5,150,105,0.04)';
    const hue = ((percent - 30) / 70) * 120;
    return `hsla(${hue},${isDark ? '35%' : '40%'},50%,${isDark ? '0.12' : '0.06'})`;
};

export const getLocality = (row: any): string =>
    row.locality || row.localidad || row.municipio || row.municipality || row.city || row.ciudad || '';

export const isEditableKey = (k: string): boolean =>
    !EXCLUDED_FIELDS.includes(k.toLowerCase()) && k !== '_categoria';

export type View = 'dashboard' | 'data';
