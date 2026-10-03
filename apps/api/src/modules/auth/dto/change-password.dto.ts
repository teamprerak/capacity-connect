import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(72, { message: 'New password must be at most 72 characters long' })
  // H-6 FIX: Match the same complexity rules enforced by RegisterDto
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,72}$/, {
    message: 'New password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
  })
  newPassword!: string;
}

