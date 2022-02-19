import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as uuid from 'uuid';
import { EmailService } from 'src/email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, Transaction } from 'typeorm';
import { User } from './entities/user.entity';
import { ulid } from 'ulid';
@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private connection: Connection,
  ) {}

  verifyEmail(signupVerifyToken: string): string | PromiseLike<string> {
    throw new Error('Method not implemented.');
  }
  @Transaction()
  async createUser(
    name: string,
    email: string,
    password: string,
    bigClass: number,
    middleClass: number,
  ) {
    const userExist = await this.checkUserExists(email);
    if (userExist) {
      throw new UnprocessableEntityException(
        '해당 이메일로는 가입할 수 없습니다.',
      );
    }
    await this.checkUserExists(email);
    const signupVerifyToken = uuid.v1();
    await this.saveUserUsingTransaction(
      name,
      email,
      password,
      signupVerifyToken,
      bigClass,
      middleClass,
    );
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  async create(name: string, email: string, password: string) {
    await this.checkUserExists(email);
    return 'This action adds a new user';
  }

  private async checkUserExists(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ email });
    return user !== undefined;
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );
  }

  private async saveUser(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
    bigClass: number,
    middleClass: number,
  ) {
    const user = new User();
    user.id = ulid();
    user.name = name;
    user.email = email;
    user.password = password;
    user.signupVerifyToken = signupVerifyToken;
    user.bigClass = bigClass;
    user.middleClass = middleClass;
    await this.usersRepository.save(user);
  }

  private async saveUserUsingTransaction(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
    bigClass: number,
    middleClass: number,
  ) {
    await this.connection.transaction(async (manager) => {
      const user = new User();
      user.id = ulid();
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;
      user.bigClass = bigClass;
      user.middleClass = middleClass;

      await manager.save(user);

      // throw new InternalServerErrorException();
    });
  }

  private async saveUserUsingQueryRunner(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
    bigClass: number,
    middleClass: number,
  ) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = new User();
      user.id = ulid();
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;
      user.bigClass = bigClass;
      user.middleClass = middleClass;

      await queryRunner.manager.save(user);

      // throw new InternalServerErrorException(); // 일부러 에러를 발생시켜 본다

      await queryRunner.commitTransaction();
    } catch (e) {
      // 에러가 발생하면 롤백
      await queryRunner.rollbackTransaction();
    } finally {
      // 직접 생성한 QueryRunner는 해제시켜 주어야 함
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
