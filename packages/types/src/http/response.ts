export interface ResponseMeta {
  requestId: string;
  timestamp: string;
}
export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

export interface PaginationMeta extends ResponseMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface EmptyResponse {
  success: true;
  message: string;
  data: null;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | EmptyResponse;

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}
