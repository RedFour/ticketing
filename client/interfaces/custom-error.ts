export interface ServerError {
  errors: CustomError[];
}

export interface CustomError {
  message: string;
  field?: string;
}
