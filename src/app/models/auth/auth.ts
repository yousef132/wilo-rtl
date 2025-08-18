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
  id:string;
  userName: string;
  arName: string;
  email: string;
  title:string;
}

export interface UserCourses {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  status: 'enrolled' | 'completed';
  enrolledDate: Date;
  completedDate?: Date;
  instructor: string;
  duration: string;
  certificateUrl?: string;
}
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  avatar?: string;
  joinDate: Date;
  totalCourses: number;
  completedCourses: number;
}

//                     // ArName = user.ArName,
//                     // EnName = user.EnName,
//                     // ProfileImage = user.ProfileImage
export interface UpdateProfileResponse{
arName:string;
profileImage?:string;  
title:string;
}

export interface UpdateUserForAdminResponse {
  title: string;
  email: string;
  arName: string;
}