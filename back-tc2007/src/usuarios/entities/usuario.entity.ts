export class Usuario {
  id!: number;
  correo!: string;
  contrasena!: string;
  nombre!: string;
  rolId!: number;
  createdAt!: Date;
  deletedAt!: Date | null;
}