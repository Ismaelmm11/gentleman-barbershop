// barbershop-api/src/users/users.service.ts
import { Inject, Injectable, NotFoundException, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersQueryDto } from './dto/find-all-users-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RecurringBlocksService } from 'src/recurring-blocks/recurring-blocks.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  /**
   * El constructor inyecta la instancia de Kysely (nuestra conexión a la BD)
   * que hemos configurado y hecho disponible globalmente en el DatabaseModule.
   * El RecurringBlocksService, para asociar a los barberos/tatuadores un horario.
   */
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>,
    private readonly recurringBlocksService: RecurringBlocksService,
  ) { }

  /**
   * Crea un nuevo usuario y su perfil asociado dentro de una transacción.
   * Esto asegura que ambas operaciones se completen con éxito, o ninguna lo haga.
   */
  async create(
    createUserDto: CreateUserDto,
    creator?: { userId: number; rol: string },
  ) {
    // Separamos los datos del perfil de los datos del usuario.
    const { tipo_perfil, username, password, fecha_nacimiento, ...restOfUserData } = createUserDto;

    if (tipo_perfil === 'ADMIN') {
      throw new BadRequestException(
        'No es posible crear nuevos administradores.',
      );
    }
    // REGLA DE ORO: Si el que crea NO es un ADMIN y está intentando crear un usuario
    // que NO sea CLIENTE, se le deniega el acceso.
    if (tipo_perfil !== 'CLIENTE' && (!creator || creator.rol !== 'ADMIN')) {
      throw new UnauthorizedException(
        'No tienes permisos para crear este tipo de usuario.',
      );
    }

    // Regla 1: Si el perfil es CLIENTE, no puede tener username ni password.
    if (tipo_perfil === 'CLIENTE' && (username || password)) {
      throw new BadRequestException(
        'Los clientes no pueden tener username o password.',
      );
    }
    // Regla 2: Si el perfil NO es CLIENTE, el username y password son obligatorios.
    if (tipo_perfil !== 'CLIENTE' && (!username || !password)) {
      throw new BadRequestException(
        'El username y la password son obligatorios para este tipo de perfil.',
      );
    }

    // Si se proporciona un username, verificamos si ya existe en la base de datos.
    if (username) {
      const existingUser = await this.findOneByUsername(username);
      if (existingUser) {
        // Lanza un error 409 Conflict si el username ya está en uso.
        throw new ConflictException(`El nombre de usuario '${username}' ya está en uso.`);
      }
    }

    //Declaramos explícitamente que la variable puede ser string O null.
    let hashedPassword: string | null = null;
    // Solo hasheamos la contraseña si se proporciona una.
    if (password) {
      // El '10' es el "costo" o "salt rounds". Es un buen valor por defecto.
      // Un número más alto es más seguro pero más lento.
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const existingPhone = await this.findOneByPhone(createUserDto.telefono);
    if (existingPhone) {
        // Lanza un error 409 Conflict si el teléfono ya está en uso.
        throw new ConflictException(`El número de teléfono '${createUserDto.telefono}' ya está registrado.`);
    }

    // Kysely nos ofrece una forma muy elegante de manejar transacciones.
    const newUserId = await this.db.transaction().execute(async (trx) => {
      // 1. Insertar el usuario usando el objeto de transacción 'trx'.
      const userResult = await trx
        .insertInto('usuario')
        .values({
          ...restOfUserData,
          username,
          fecha_nacimiento: new Date(fecha_nacimiento),
          password: hashedPassword,
        })
        .executeTakeFirstOrThrow();

      const userId = Number(userResult.insertId);

      // 2. Insertar el perfil asociado usando el ID del usuario recién creado.
      await trx
        .insertInto('perfil')
        .values({
          id_usuario: userId,
          tipo: tipo_perfil,
        })
        .execute();

      // Si todo va bien, la transacción devuelve el ID del nuevo usuario.
      return userId;
    });

    // --- LÓGICA POST-CREACIÓN (Fuera de la transacción principal) ---
    // 3. SI EL NUEVO USUARIO ES PERSONAL, CREAR SUS DESCANSOS POR DEFECTO.
    if (['BARBERO', 'TATUADOR'].includes(tipo_perfil)) {
      // Usamos el RecurringBlocksService para crear los descansos por defecto.
      // Lunes
      await this.recurringBlocksService.create(newUserId, {
        dias_semana: [1],
        hora_inicio: '06:00',
        hora_fin: '23:59',
        titulo: 'Descanso por defecto',
      });
      // Domingo
      await this.recurringBlocksService.create(newUserId, {
        dias_semana: [7],
        hora_inicio: '06:00',
        hora_fin: '23:59',
        titulo: 'Descanso por defecto',
      });
    }

    return this.findOne(newUserId);
  }

  /**
   * Devuelve una lista paginada y filtrada de usuarios.
   * @param queryParams Los parámetros de la URL para filtrar y paginar.
   * @returns Un objeto con los datos, el total de resultados y la información de paginación.
   */
  async findAll(queryParams: FindAllUsersQueryDto) {
    const { limit = 10, page = 1, searchTerm, rol } = queryParams; // Usamos searchTerm
    const offset = (page - 1) * limit;

    let dataQuery = this.db.selectFrom('usuario').selectAll();
    let countQuery = this.db.selectFrom('usuario').select((eb) => eb.fn.countAll().as('total'));

    // Si se proporciona un rol, hacemos un JOIN para filtrar
    if (rol) {
        dataQuery = dataQuery.innerJoin('perfil', 'perfil.id_usuario', 'usuario.id')
            .where('perfil.tipo', '=', rol);
        
        countQuery = countQuery.innerJoin('perfil', 'perfil.id_usuario', 'usuario.id')
            .where('perfil.tipo', '=', rol);
    }

    // Si se proporciona un término de búsqueda, aplicamos el filtro a múltiples columnas
    if (searchTerm) {
        const filter = `%${searchTerm}%`;
        
        // Usamos un grupo de condiciones 'OR' para buscar en varios campos
        dataQuery = dataQuery.where((eb) => eb.or([
            eb('nombre', 'like', filter),
            eb('apellidos', 'like', filter),
            eb('telefono', 'like', filter)
        ]));
        
        countQuery = countQuery.where((eb) => eb.or([
            eb('nombre', 'like', filter),
            eb('apellidos', 'like', filter),
            eb('telefono', 'like', filter)
        ]));
    }

    // Ejecutamos ambas consultas en paralelo para mayor eficiencia usando Promise.all.
    const [users, countResult] = await Promise.all([
      dataQuery.limit(limit).offset(offset).execute(), // Aplicamos paginación solo a la consulta de datos.
      countQuery.executeTakeFirstOrThrow(),
    ]);

    // Por seguridad, eliminamos la contraseña de cada usuario antes de devolver los datos.
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // El resultado del conteo (`countAll`) viene como un BigInt.
    // Lo convertimos a número para poder usarlo en cálculos como Math.ceil.
    const total = Number(countResult.total);

    // Devolvemos un objeto de respuesta estándar para paginación.
    // Esto le da al frontend toda la información que necesita para renderizar los controles de paginación.
    return {
      data: sanitizedUsers,
      meta: {
        total: total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Busca y devuelve un único usuario por su ID.
   */
  async findOne(id: number) {
    const user = await this.db
      .selectFrom('usuario')
      .innerJoin('perfil', 'perfil.id_usuario', 'usuario.id')
      .selectAll('usuario')
      .select(['perfil.tipo as rol']) // Añadimos el rol al resultado
      .where('usuario.id', '=', id) // Especificamos la tabla para evitar ambigüedad en el 'id'
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // Como siempre, eliminamos la contraseña antes de devolver el objeto.
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findOneByUsername(username: string) {
    // Este método devuelve el usuario CON su contraseña y con su rol,
    // porque el AuthService la necesita para comparar.
    // Es un método "interno" y no se expondrá en una ruta pública.
    return this.db
      .selectFrom('usuario')
      .innerJoin('perfil', 'perfil.id_usuario', 'usuario.id') // Unimos con la tabla perfil.
      .selectAll('usuario') // Seleccionamos todas las columnas de la tabla usuario.
      .select('perfil.tipo as rol') // Y seleccionamos la columna 'tipo' de perfil, renombrándola a 'rol'.
      .where('username', '=', username)
      .executeTakeFirst();
  }

  // =======================================================================
  // === NUEVO MÉTODO DE BÚSQUEDA PARA EL FLUJO DE CITAS ===================
  // =======================================================================

  /**
   * Busca un usuario por su número de teléfono.
   * Devuelve el usuario completo si lo encuentra, o null si no existe.
   * Es una herramienta interna para ser usada por otros servicios.
   * @param phone - El número de teléfono a buscar.
   * @returns El objeto de usuario o null.
   */
  async findOneByPhone(phone: string) {
    return this.db
      .selectFrom('usuario')
      .selectAll()
      .where('telefono', '=', phone)
      .executeTakeFirst(); // Devuelve el primer resultado o undefined si no hay ninguno.
  }

  /**
   * Actualiza los datos de un usuario.
   * Sigue un patrón de 2 pasos compatible con MySQL.
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const { fecha_nacimiento, password, ...restOfDto } = updateUserDto;
    const dataToUpdate: any = { ...restOfDto };

    // Si la fecha de nacimiento viene en la petición, la convertimos a objeto Date.
    if (fecha_nacimiento) {
      dataToUpdate.fecha_nacimiento = new Date(fecha_nacimiento);
    }

    if (password) {
      throw new BadRequestException('Para cambiar la contraseña, por favor use la ruta específica.');
    }


    // 1. Ejecutamos la actualización.
    await this.db
      .updateTable('usuario')
      .set(dataToUpdate)
      .where('id', '=', id)
      .executeTakeFirst();

    // 2. Buscamos y devolvemos el usuario con los datos ya actualizados.
    return this.findOne(id);
  }

  /**
   * Actualiza el perfil (rol) de un usuario específico.
   * @param userId El ID del usuario a modificar.
   * @param updateProfileDto El nuevo perfil a asignar.
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    // Buscamos el perfil del usuario para asegurarnos de que existe antes de actualizar.
    const profile = await this.db.selectFrom('perfil').selectAll().where('id_usuario', '=', userId).executeTakeFirst();

    if (!profile) {
      throw new NotFoundException(`No se encontró un perfil para el usuario con ID ${userId}.`);
    }

    await this.db
      .updateTable('perfil')
      .set({ tipo: updateProfileDto.tipo_perfil })
      .where('id_usuario', '=', userId)
      .execute();

    return { message: `Perfil del usuario con ID ${userId} actualizado a ${updateProfileDto.tipo_perfil}.` };
  }

  /**
   * Elimina un usuario de la base de datos por su ID.
   */
  async remove(id: number) {
    const result = await this.db
      .deleteFrom('usuario')
      .where('id', '=', id)
      .executeTakeFirst();

    // La consulta de borrado devuelve el número de filas afectadas.
    // Si es 0, significa que no se encontró un usuario con ese ID.
    if (result.numDeletedRows === 0n) {
      throw new NotFoundException(`No se pudo eliminar. Usuario con ID ${id} no encontrado.`);
    }

    return { message: `Usuario con ID ${id} eliminado correctamente.` };
  }

  /**
   * Busca un usuario por su número de teléfono. Si no existe, lo crea.
   * @param clientData - Los datos del cliente, incluyendo ahora la fecha de nacimiento.
   * @param trx - Un objeto de transacción opcional de Kysely.
   * @returns El usuario encontrado o recién creado.
   */
  async findOrCreateClient(
    clientData: { nombre: string; apellidos: string; telefono: string; fecha_nacimiento: string },
    trx: Kysely<DB> = this.db,
  ) {
    const existingUser = await trx
      .selectFrom('usuario')
      .selectAll()
      .where('telefono', '=', clientData.telefono)
      .executeTakeFirst();

    if (existingUser) {
      return existingUser;
    }

    return this.db.transaction().execute(async (innerTrx) => {
      const newUserResult = await innerTrx
        .insertInto('usuario')
        .values({
          nombre: clientData.nombre,
          apellidos: clientData.apellidos,
          telefono: clientData.telefono,
          // CORRECCIÓN: Usamos la fecha de nacimiento proporcionada.
          fecha_nacimiento: new Date(clientData.fecha_nacimiento),
          username: null,
          password: null,
        })
        .executeTakeFirstOrThrow();

      const newUserId = Number(newUserResult.insertId);

      await innerTrx
        .insertInto('perfil')
        .values({
          id_usuario: newUserId,
          tipo: 'CLIENTE',
        })
        .execute();

      return trx
        .selectFrom('usuario')
        .selectAll()
        .where('id', '=', newUserId)
        .executeTakeFirstOrThrow();
    });
  }

  /**
   * Cambia la contraseña de un usuario autenticado.
   * @param userId El ID del usuario (obtenido del token).
   * @param changePasswordDto Objeto con la contraseña antigua y la nueva.
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    // 1. Buscamos al usuario completo, incluyendo su contraseña actual.
    const user = await this.db.selectFrom('usuario').selectAll().where('id', '=', userId).executeTakeFirst();

    if (!user || !user.password) {
      throw new UnauthorizedException('El usuario no puede cambiar la contraseña.');
    }

    // 2. Comparamos la "contraseña antigua" proporcionada con la que hay en la BD.
    const isOldPasswordCorrect = await bcrypt.compare(changePasswordDto.oldPassword, user.password);

    if (!isOldPasswordCorrect) {
      throw new UnauthorizedException('La contraseña antigua es incorrecta.');
    }

    // 3. Hasheamos la nueva contraseña.
    const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // 4. Actualizamos la BD con la nueva contraseña hasheada.
    await this.db
      .updateTable('usuario')
      .set({ password: newHashedPassword })
      .where('id', '=', userId)
      .execute();

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
