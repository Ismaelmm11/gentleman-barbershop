// barbershop-api/src/auth/auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Inyectamos tanto el servicio de usuarios como el de JWT.
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>,
  ) { }

  /**
   * Procesa el login de un usuario.
   * Valida las credenciales y, si son correctas, genera un JWT.
   * @param username El nombre de usuario.
   * @param pass La contraseña en texto plano.
   * @returns Un objeto que contiene el token de acceso.
   */
  async login(username: string, pass: string) {
    const user = await this.usersService.findOneByUsername(username);

    // La condición ahora comprueba tres cosas en orden:
    // 1. ¿Existe el usuario (`user`)?
    // 2. ¿Tiene ese usuario una contraseña guardada (`user.password`)?
    // 3. Si ambas son ciertas, ¿coincide la contraseña proporcionada con el hash guardado?
    if (!user || !user.password || !(await bcrypt.compare(pass, user.password))) {
      // Si el usuario no existe, no tiene contraseña o la contraseña no coincide...
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // --- ¡Aquí está la magia! ---
    // El "payload" son los datos que queremos guardar dentro del token.
    // ¡NUNCA guardes datos sensibles como la contraseña aquí!
    const payload = {
      sub: user.id, // 'sub' (subject) es el estándar para el ID del usuario.
      username: user.username,
      rol: user.rol,
      jti: randomUUID(),
    };

    // El método `sign` toma el payload y, usando el 'secret' que configuramos
    // en el módulo, genera el token firmado y seguro.
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Invalida un token añadiéndolo a la lista negra.
   * @param token El token JWT a invalidar.
   */
  async logout(token: string) {
    try {
      // Verificamos el token para extraer su payload (incluyendo jti y exp).
      const payload = this.jwtService.verify(token);
      const jti = payload.jti;

      // Si el token no tiene un jti, no podemos invalidarlo.
      if (!jti) {
        throw new Error('Token no invalidable.');
      }

      // La fecha de expiración (exp) viene en segundos, la convertimos a milisegundos.
      const expirationDate = new Date(payload.exp * 1000);

      // Lo insertamos en nuestra tabla de lista negra.
      await this.db
        .insertInto('token_blocklist')
        .values({
          jti: jti,
          fecha_expiracion: expirationDate,
        })
        .execute();

      return { message: 'Sesión cerrada correctamente.' };
    } catch (error) {
      // Si el token ya es inválido o ha expirado, no hacemos nada.
      return { message: 'El token ya es inválido.' };
    }
  }
}
