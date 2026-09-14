export class User {
    id: number | undefined;
    email: string | undefined;
    passwordHash: string | undefined;
    salt: string | undefined;
    nombre: string | undefined;
    createdAt: Date | undefined;
    rolId: number | undefined;
    deletedAt: Date | undefined;
}