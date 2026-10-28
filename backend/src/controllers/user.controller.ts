import {Response} from 'express';
import {AuthRequest} from '../middleware/auth.middleware';
import {UserService} from "../service/user.service";
import {ForbiddenError} from "../utils/HttpErrorHandler.util";

export class UserController {
  constructor(private userService: UserService) {}

  async getById(req: AuthRequest, res: Response) {
    const userId = Number(req.params.id);
    const user = await this.userService.getUserId(userId)
    return res.status(200).json(user);
  }

  async delete(req: AuthRequest, res: Response) {
    const userId = Number(req.params.id);
    if (req.userId !== userId) throw new ForbiddenError('You can only delete your own account');
    await this.userService.deleteUser(userId)
    return res.status(200).json({ message: 'User deleted successfully' });
  }

  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    const userId = Number(req.userId);
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (!isDev) throw new ForbiddenError('Admin self-promotion is only available in development');

    const user = await this.userService.updateToAdmin(userId)
    return res.status(200).json(user);

  }
}
