import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from 'src/core/dto';
import {
  ForgotPasswordDto,
  IdParamsDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from 'src/core/dto/auth.dto';
import { IsLoggedInUserGuard } from 'src/core/guards/loggedInUser.guard';
import { JwtGuard } from 'src/use-cases/auth/guards/jwt-auth.guard';
import { UserUseCases } from 'src/use-cases/user/user.use-case';

@ApiTags('User')
@Controller('api/v1/user')
@ApiBearerAuth('JWT')
export class UserController {
  constructor(private userUseCases: UserUseCases) {}

  @Post()
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for user object',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userUseCases.createUser(createUserDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while creating the user',
      );
    }
  }
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Json structure for user object',
  })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      return this.userUseCases.forgotPassword(email);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiBody({
    type: ResetPasswordDto,
    description: 'Json structure for user object',
  })
  @ApiParam({ name: 'token' })
  @ApiParam({ name: 'id' })
  @Patch('reset-password/:token/:id')
  async resetPassword(
    @Body('password') password: string,
    @Param('token') token: string,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;

    try {
      return this.userUseCases.resetPassword(password, token, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiBody({
    type: UpdatePasswordDto,
    description: 'Json structure for user object',
  })
  @ApiParam({ name: 'id' })
  @UseGuards(JwtGuard, IsLoggedInUserGuard)
  @Patch('update-password/:id')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Param() params: IdParamsDto,
  ) {
    try {
      const { id } = params;

      return this.userUseCases.updatePassword(updatePasswordDto, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserDto,
    description: 'Json structure for user object',
  })
  @UseGuards(JwtGuard, IsLoggedInUserGuard)
  @ApiParam({ name: 'id' })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Param() params: IdParamsDto,
  ) {
    try {
      const { id } = params;

      return this.userUseCases.updateUser(updateUserDto, file, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while updating the user',
      );
    }
  }

  @ApiParam({ name: 'token' })
  @ApiParam({ name: 'id' })
  @Get('verify/token/:token/:id')
  async verifyEmail(
    @Param('token') token: string,
    @Param() params: IdParamsDto,
  ) {
    try {
      const { id } = params;

      return this.userUseCases.verifyUser(token, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while verifying email',
      );
    }
  }
}
