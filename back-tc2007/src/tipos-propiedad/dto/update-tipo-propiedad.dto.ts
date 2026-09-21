import { PartialType } from '@nestjs/swagger';
import { CreateTipoPropiedadDto } from './create-tipo-propiedad.dto';

/** Datos para actualizar un tipo de propiedad vía `PATCH /tipos-propiedad/:id`. */
export class UpdateTipoPropiedadDto extends PartialType(
  CreateTipoPropiedadDto,
) {}
