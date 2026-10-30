import {Request, Response} from 'express';
import {TeacherService} from "../service/teacher.service";

export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  async getAll(req: Request, res: Response) {
    const teachers = await this.teacherService.getAll();
    return res.status(200).json(teachers);
  }

  async getById(req: Request, res: Response) {
    const teacher = await this.teacherService.getById(Number(req.params.id));
    return res.status(200).json(teacher);
  }
}
