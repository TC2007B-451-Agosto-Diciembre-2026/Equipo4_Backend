import { PartialType } from '@nestjs/swagger';
import { CreateFuenteDto } from './create-fuente.dto';

/** Datos para actualizar una fuente vía `PATCH /fuentes/:id`. Todos los campos son opcionales. */
export class UpdateFuenteDto extends PartialType(CreateFuenteDto) {}
