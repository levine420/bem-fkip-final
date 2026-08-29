export class AdminError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "AdminError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
