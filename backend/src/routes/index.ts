import {Router} from 'express';
import {AuthController} from '../controllers/auth.controller';
import {SessionController} from '../controllers/session.controller';
import {TeacherController} from '../controllers/teacher.controller';
import {UserController} from '../controllers/user.controller';
import {authMiddleware} from '../middleware/auth.middleware';
import {validate} from '../middleware/validate.middleware';
import {LoginSchema, RegisterSchema} from '../dto/auth.dto';
import {asyncHandler} from "../middleware/asyncHandler";
import {AuthService} from "../service/auth.service";
import {UsersRepository} from "../repository/users.repository";
import {PrismaClient} from "@prisma/client";


const router = Router();

// Prisma

const prismaClient = new PrismaClient();

// Repositories
const usersRepository = new UsersRepository(prismaClient);

// Services
const authService = new AuthService(usersRepository);

// Controllers
const authController = new AuthController(authService);
const sessionController = new SessionController();
const teacherController = new TeacherController();
const userController = new UserController();

// Auth routes (public)
router.post('/api/auth/login', validate(LoginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/api/auth/register', validate(RegisterSchema), (req, res) => authController.register(req, res));

// Session routes (protected)
router.get('/api/session', authMiddleware, (req, res) => sessionController.getAll(req, res));
router.get('/api/session/:id', authMiddleware, (req, res) => sessionController.getById(req, res));
router.post('/api/session', authMiddleware, (req, res) => sessionController.create(req, res));
router.put('/api/session/:id', authMiddleware, (req, res) => sessionController.update(req, res));
router.delete('/api/session/:id', authMiddleware, (req, res) => sessionController.delete(req, res));
router.post('/api/session/:id/participate/:userId', authMiddleware, (req, res) => sessionController.participate(req, res));
router.delete('/api/session/:id/participate/:userId', authMiddleware, (req, res) => sessionController.unparticipate(req, res));

// Teacher routes (protected)
router.get('/api/teacher', authMiddleware, (req, res) => teacherController.getAll(res));
router.get('/api/teacher/:id', authMiddleware, (req, res) => teacherController.getById(req, res));

// User routes (protected)
router.get('/api/user/:id', authMiddleware, (req, res) => userController.getById(req, res));
router.post('/api/user/promote-admin', authMiddleware, (req, res) =>
  userController.promoteSelfToAdmin(req, res),
);
router.delete('/api/user/:id', authMiddleware, (req, res) => userController.delete(req, res));

export default router;
