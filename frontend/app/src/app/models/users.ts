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
  fullname: string;
  shortname: string;
  password: string;
  foundingdate: string;
  location: string;
  email: string;
}

export interface Admin {
  username: string;
  password: string;
}
