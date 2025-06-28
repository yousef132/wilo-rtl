export class Register{
    arName:string = '';
    email:string='';
    password:string='';
    title:string='';

}
export class Login {
    email: string = '';
    password: string = '';
}

export interface LoginResponse {
  token: string ;
  expiration: Date ;
}
export interface CreateCoachCommand {
  email: string;
  password: string;
  arName: string;
  title: string;
}
export interface UserResponse {
  userName: string;
  arName: string;
  email: string;
}
