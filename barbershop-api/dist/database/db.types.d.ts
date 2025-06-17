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
    estado: 'PENDIENTE' | 'CERRADO' | 'CANCELADO' | 'DESCANSO';
}
export interface MarcaTable {
    id: Generated<number>;
    nombre: string;
}
export interface CategoriaTable {
    id: Generated<number>;
    nombre: string;
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
export interface VistaDiariaBarbero {
    fecha: Date;
    id_barbero: number;
    nombre_completo_barbero: string;
    total_citas: number;
    ingresos_totales: number;
    ticket_medio_por_cita: number;
    productos_vendidos_en_citas: number;
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
    VISTA_DIARIA_BARBERO: VistaDiariaBarbero;
}
