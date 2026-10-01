import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

/**
 * Datos para actualizar un usuario vía `PATCH /usuarios/:id`.
 *
 * Todos los campos de {@link CreateUsuarioDto} se vuelven opcionales;
 * solo se actualizan las columnas presentes en el body. Si se manda
 * `contrasena`, el servicio genera un nuevo salt y la vuelve a hashear.
 */
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
