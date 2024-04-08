export class QueryDto {
  search?: string;
  searchBy?: string[];
  findOperation?: object;
  pageSize?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
