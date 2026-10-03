import { IsObject, IsNotEmpty } from 'class-validator';

export class SubmitOnboardingDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, any>;
}
