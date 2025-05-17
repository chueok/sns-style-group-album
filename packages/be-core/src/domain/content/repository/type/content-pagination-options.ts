type PaginationCommon = {
  limit: number;
  sortOrder: 'asc' | 'desc';
};

type PaginationByCreatedDateTime = {
  cursor?: Date;
  sortBy: 'createdDateTime';
};

export type ContentPaginationOptionsTypeMap = {
  createdDateTime: PaginationCommon & PaginationByCreatedDateTime;
};

export type ContentPaginationOptions =
  ContentPaginationOptionsTypeMap['createdDateTime'];
