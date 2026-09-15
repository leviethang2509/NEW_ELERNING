import { Controller, Get } from '@nestjs/common';
import type { MeContexts } from '@lang/shared';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator';
import { MembershipsService } from './memberships.service';

@Controller('me')
export class MeContextsController {
  constructor(private readonly memberships: MembershipsService) {}

  /** Switcher và trang "Không gian của tôi" dùng để liệt kê ngữ cảnh. */
  @Get('contexts')
  contexts(@CurrentUser() user: RequestUser): Promise<MeContexts> {
    return this.memberships.getContexts(user);
  }
}
