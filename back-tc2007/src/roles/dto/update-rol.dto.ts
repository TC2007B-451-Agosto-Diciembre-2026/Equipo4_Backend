import { PartialType } from '@nestjs/swagger';
import { CreateRolDto } from './create-rol.dto';

/** Datos para actualizar un rol vía `PATCH /roles/:id`. Todos los campos son opcionales. */
export class UpdateRolDto extends PartialType(CreateRolDto) {}
