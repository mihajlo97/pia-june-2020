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
}
