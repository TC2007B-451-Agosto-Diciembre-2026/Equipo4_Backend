export class Usuario {
  id!: number;
  correo!: string;
  contrasena!: string;
  salt: string | undefined;
  nombre!: string;
  rolId!: number;
  createdAt!: Date;
  deletedAt!: Date | null;
}