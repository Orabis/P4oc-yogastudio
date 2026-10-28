import {Request, Response} from 'express';
import {AuthService} from "../service/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await this.authService.loginUser(email, password)
    res.status(200).json(user);
  }

  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName } = req.body;

    const user = await this.authService.registerUser(email, password, firstName, lastName)
    res.status(200).json({user})

  }
}
