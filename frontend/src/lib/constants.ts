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

// Status color system: violet (incomplete) → gold (partial) → sage (complete)
export const getSolidColor = (percent: number, _isDark?: boolean): string => {
    if (percent >= 95) return '#A3B18A';  // sage-light — complete
    if (percent >= 60) return '#D4AF37';  // gold — partial
    if (percent >= 30) return '#C084FC';  // purple — low
    return '#A78BFA';                     // violet — very low
};

export const getPastelColor = (percent: number, _isDark?: boolean): string => {
    if (percent >= 95) return 'rgba(163, 177, 138, 0.09)';
    if (percent >= 60) return 'rgba(212, 175,  55, 0.09)';
    if (percent >= 30) return 'rgba(192, 132, 252, 0.09)';
    return 'rgba(167, 139, 250, 0.09)';
};

export const getLocality = (row: any): string =>
    row.locality || row.localidad || row.municipio || row.municipality || row.city || row.ciudad || '';

export const isEditableKey = (k: string): boolean =>
    !EXCLUDED_FIELDS.includes(k.toLowerCase()) && k !== '_categoria';

export type View = 'dashboard' | 'data';
