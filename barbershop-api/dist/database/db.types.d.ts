import { Generated } from 'kysely';
export interface UsuarioTable {
    id: Generated<number>;
    nombre: string;
    apellidos: string;
    username: string | null;
    password: string | null;
    telefono: string;
    fecha_nacimiento: Date;
}
export interface PerfilTable {
    id: Generated<number>;
    id_usuario: number;
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
    id_servicio: number | null;
    fecha_hora_inicio: Date;
    fecha_hora_fin: Date;
    precio_final: number | null;
    estado: 'PENDIENTE_CONFIRMACION' | 'PENDIENTE' | 'CERRADO' | 'CANCELADO' | 'DESCANSO';
}
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
    precio_final: number;
    fecha_pedido: Date;
}
export interface ProductoPedidoTable {
    id_pedido: number;
    id_producto: number;
    unidades: number;
    precio_unitario: number;
}
export interface CitaProductoTable {
    id: Generated<number>;
    id_cita: number;
    id_producto: number;
    precio_venta: number;
}
export interface TokenBlocklistTable {
    jti: string;
    fecha_expiracion: Date;
}
export interface HorarioBloqueadoRecurrenteTable {
    id: Generated<number>;
    id_usuario: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    titulo: string | null;
}
export interface OtpCodesTable {
    id: Generated<number>;
    id_cita_provisional: number;
    codigo: string;
    fecha_expiracion: Date;
    intentos: Generated<number>;
    datos_cliente_json: string | null;
}
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
export interface DB {
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
    v_analiticas_diarias_profesional: VAnaliticasDiariasProfesional;
    v_analiticas_diarias_servicio: VAnaliticasDiariasServicio;
    v_analiticas_clientes: VAnaliticasClientes;
}
