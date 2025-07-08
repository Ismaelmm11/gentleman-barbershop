export declare class FindAllUsersQueryDto {
    searchTerm?: string;
    rol?: 'ADMIN' | 'BARBERO' | 'TATUADOR' | 'CLIENTE';
    limit?: number;
    page?: number;
}
