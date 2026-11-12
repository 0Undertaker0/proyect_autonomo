import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'AI Content Empire backend is running in zero-cost mode.';
  }
}
