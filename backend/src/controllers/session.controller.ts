import {Response} from 'express';
import {AuthRequest} from '../middleware/auth.middleware';
import {SessionService} from "../service/session.service";

export class SessionController {
  constructor(private sessionService: SessionService) {}

  async getAll(req: AuthRequest, res: Response) {
    const sessions = await this.sessionService.getAll();
    return res.status(200).json(sessions);
  }

  async getById(req: AuthRequest, res: Response) {
    const session = await this.sessionService.getById(Number(req.params.id));
    return res.status(200).json(session);
  }

  async create(req: AuthRequest, res: Response) {
    const session = await this.sessionService.create(Number(req.userId), req.body);
    return res.status(201).json(session);
  }

  async update(req: AuthRequest, res: Response) {
    const session = await this.sessionService.update(Number(req.userId), Number(req.params.id), req.body);
    return res.status(200).json(session);
  }

  async delete(req: AuthRequest, res: Response) {
    await this.sessionService.delete(Number(req.userId), Number(req.params.id));
    return res.status(200).json({ message: 'Session deleted successfully' });
  }

  async participate(req: AuthRequest, res: Response) {
    await this.sessionService.participate(Number(req.params.id), Number(req.params.userId));
    return res.status(200).json({ message: 'Successfully joined the session' });
  }

  async unparticipate(req: AuthRequest, res: Response) {
    await this.sessionService.unparticipate(Number(req.params.id), Number(req.params.userId));
    return res.status(200).json({ message: 'Successfully left the session' });
  }
}
