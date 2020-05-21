export interface Farmer {
  name: string;
  surname: string;
  username: string;
  password: string;
  birthdate: Date;
  birthplace: string;
  cellphone: string;
  email: string;
}

export interface Company {
  name: string;
  alias: string;
  pass: string;
  foundingDate: Date;
  hq: string;
  email: string;
}

export interface Admin {
  username: string;
  password: string;
  email: string;
}

export interface MasterAccountTemplate {
  username: string;
  password: string;
  role: string;
  email: string;
  name?: string;
  surname?: string;
  birthdate?: Date;
  birthplace?: string;
  cellphone?: string;
  foundingDate?: Date;
  hq?: string;
}

export enum Roles {
  ADMIN = 'admin',
  WORKER = 'worker',
  COMPANY = 'company',
  NONE = 'none',
}
