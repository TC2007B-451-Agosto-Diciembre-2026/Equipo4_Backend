export class Usuario {
  id!: number;
  ownerId: string | undefined;
  correo!: string;
  contrasena!: string;
  nombre!: string;
  rolId!: number;
  createdAt!: Date;
  deletedAt!: Date | null;
}