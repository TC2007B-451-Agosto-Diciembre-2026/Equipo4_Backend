import { PartialType } from '@nestjs/swagger';
import { CreateTipoFraudeDto } from './create-tipo-fraude.dto';

/** Datos para actualizar un tipo de fraude vía `PATCH /tipos-fraude/:id`. */
export class UpdateTipoFraudeDto extends PartialType(CreateTipoFraudeDto) {}
