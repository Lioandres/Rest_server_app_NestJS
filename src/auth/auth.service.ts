import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcrypt'
import { loginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Payload } from './interfaces/payload.interface';
import { LoginInterface } from './interfaces/login.interface';
import { RegsiterUderDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) private UserModel: Model<User>,
                                      private jwtService: JwtService){}

  async create(createUserDto: CreateUserDto):Promise<User> {

    try {
      
      const {password,...userData}=createUserDto

      const userNew=new this.UserModel(
        {
         password:bcrypt.hashSync(password,10),
        
        ...userData
        })

      await userNew.save()
      
      const {password:_, ...user} = userNew.toJSON()

      return user;

    } catch (error) {
      if(error.code===11000) throw new BadRequestException(`${createUserDto.email} ya existe`) 
      throw new InternalServerErrorException('fatal Error')

      
    }

  }

  async login(loginDto:loginDto) {

    const {email, password}=loginDto

    const user= await this.UserModel.findOne({email})

    if(!user) throw new UnauthorizedException('el usaurio no existe- email')

    if(!bcrypt.compareSync(password,user.password)) throw new UnauthorizedException ('el usuario no existe-password')


    const {password:_,...rest}= user.toJSON()

    return {
            user: rest,
            token:this.getJwt({id:user.id})
          } 

  }

  async register(registerDto:RegsiterUderDto):Promise<LoginInterface> {
    const user = await this.create(registerDto)

    console.log(user)
    

    return  {
            user,
            token:this.getJwt({id:user._id})
          }

  }

  findAll():Promise<User[]> {
    return this.UserModel.find();
  }

  async findUserById(id:string) {
    const user= await this.UserModel.findById(id)
    const {password, ...rest}=user.toJSON()
    return rest

  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwt(payload:Payload){
    const token=this.jwtService.sign(payload)
    return token
  }
}
