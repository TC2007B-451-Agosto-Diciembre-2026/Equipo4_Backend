import { PartialType } from '@nestjs/swagger';
import { CreateEstadoDto } from './create-estado.dto';

/** Datos para actualizar un estado vía `PATCH /estados/:id`. */
export class UpdateEstadoDto extends PartialType(CreateEstadoDto) {}
