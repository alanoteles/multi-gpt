import { Body, Controller, Post } from '@nestjs/common';
import { SubmitPromptDto } from './dto/submit-prompt.dto';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post('query')
  queryModels(@Body() body: SubmitPromptDto) {
    return this.modelsService.queryModels(body);
  }
}
