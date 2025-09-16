export interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  errors?: Record<string, any>;
}
