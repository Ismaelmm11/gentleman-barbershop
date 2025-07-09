// barbershop-api/src/database/db.types.ts
import { Generated } from 'kysely';

// =================================================================================
// Este archivo es el "mapa" de nuestra base de datos.
// Define la estructura de cada tabla y vista para que Kysely pueda darnos
// autocompletado y seguridad de tipos en todas las consultas.
// Es nuestra única fuente de la verdad sobre la estructura de los datos.
// =================================================================================

// --- Tablas Principales y de Negocio ---

export interface UsuarioTable {
  id: Generated<number>;
  nombre: string;
  apellidos: string;
  username: string | null;
  password: string | null; // Guardaremos un hash, nunca la contraseña en texto plano
  telefono: string;
  fecha_nacimiento: Date;
  // Nota: la 'edad' no se define aquí porque no es una columna real
  // en la base de datos. Se calculará en la lógica de la aplicación (servicios)
  // para mantener una única fuente de la verdad (la fecha_nacimiento).
}

export interface PerfilTable {
  id: Generated<number>;
  id_usuario: number; // Se añade un constraint UNIQUE en la migración.
  tipo: 'ADMIN' | 'BARBERO' | 'TATUADOR' | 'CLIENTE';
}

export interface ServicioTable {
  id: Generated<number>;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio_base: number;
}

export interface CitaTable {
  id: Generated<number>;
  id_barbero: number;
  id_cliente: number | null;
  id_servicio: number | null; // Puede ser nulo para un 'DESCANSO'
  fecha_hora_inicio: Date;
  fecha_hora_fin: Date;
  precio_final: number | null; // Puede ser nulo para un 'DESCANSO' o 'CANCELADO'
  estado: 'PENDIENTE_CONFIRMACION' | 'PENDIENTE' | 'CERRADO' | 'CANCELADO' | 'DESCANSO';
}


// --- Tablas de Tienda y Productos ---

export interface MarcaTable {
  id: Generated<number>;
  nombre: string;
  url_imagen: string | null;
}

export interface CategoriaTable {
  id: Generated<number>;
  nombre: string;
  url_imagen: string | null;
}

export interface ProductoTable {
  id: Generated<number>;
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: number;
  id_marca: number;
}

export interface MediaTable {
  id: Generated<number>;
  id_producto: number;
  tipo: 'IMAGEN' | 'VIDEO';
  url: string;
  es_principal: boolean;
}

export interface PedidoTable {
  id: Generated<number>;
  id_cliente: number;
  precio_final: number; // Precio total del pedido en el momento de la compra
  fecha_pedido: Date;
}


// --- Tablas de Relación (N:M) ---

export interface ProductoPedidoTable {
  id_pedido: number;
  id_producto: number;
  unidades: number;
  precio_unitario: number; // Precio del producto en el momento de la compra
}

export interface CitaProductoTable {
  id: Generated<number>;
  id_cita: number;
  id_producto: number;
  precio_venta: number;
}

// --- Tabla Auxiliar para limpiar los JWT ---

export interface TokenBlocklistTable {
  jti: string;
  fecha_expiracion: Date;
}

// --- Tabla Descansos Recurrentes barberos ---

export interface HorarioBloqueadoRecurrenteTable {
  id: Generated<number>;
  id_usuario: number;
  dia_semana: number;
  hora_inicio: string; // Se trata como HH:MM en la lógica de la aplicación
  hora_fin: string;   // Se trata como HH:MM en la lógica de la aplicación
  titulo: string | null;
}

// --- Tabla para manejar los códigos de verificación ---
export interface OtpCodesTable {
  id: Generated<number>;
  id_cita_provisional: number;
  codigo: string;
  fecha_expiracion: Date;
  intentos: Generated<number>;
  datos_cliente_json: string | null;
}

// --- Tipos para las Vistas ---

// Tipos para las nuevas vistas de analíticas

export interface VAnaliticasDiariasProfesional {
  fecha: string;
  anio: number;
  mes: number;
  semana_del_anio: number;
  profesional_id: number;
  profesional_nombre: string;
  profesional_tipo: 'BARBERO' | 'TATUADOR';
  total_citas_dia: number;
  ingresos_diarios: number;
  ticket_promedio_dia: number;
}

export interface VAnaliticasDiariasServicio {
  fecha: string;
  servicio_id: number;
  servicio_nombre: string;
  veces_usado_dia: number;
  ingresos_por_servicio_dia: number;
}

export interface VAnaliticasClientes {
  id_cliente: number;
  nombre_completo_cliente: string;
  total_visitas: number;
  gasto_total: number;
  gasto_promedio_por_visita: number;
  fecha_primera_visita: string;
  fecha_ultima_visita: string;
}


// --- Interfaz Principal de la Base de Datos ---

// Aquí juntamos todas nuestras tablas y vistas en una única interfaz.
// Kysely usará esta interfaz `DB` como la fuente de la verdad absoluta.
export interface DB {
  // Tablas
  usuario: UsuarioTable;
  perfil: PerfilTable;
  servicio: ServicioTable;
  cita: CitaTable;
  marca: MarcaTable;
  categoria: CategoriaTable;
  producto: ProductoTable;
  media: MediaTable;
  pedido: PedidoTable;
  producto_pedido: ProductoPedidoTable;
  cita_producto: CitaProductoTable;
  token_blocklist: TokenBlocklistTable;
  horario_bloqueado_recurrente: HorarioBloqueadoRecurrenteTable;
  otp_codes: OtpCodesTable;

  // Vistas
  // --- AÑADE ESTAS TRES LÍNEAS AL FINAL ---
  v_analiticas_diarias_profesional: VAnaliticasDiariasProfesional;
  v_analiticas_diarias_servicio: VAnaliticasDiariasServicio;
  v_analiticas_clientes: VAnaliticasClientes;
}
