import { ModelKey } from '../model.types';

export class SubmitPromptDto {
  prompt!: string;
  models!: ModelKey[];
}
