import {RequestParamHandler, Router} from 'express';
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
import {UserService} from "../service/user.service";
import {InvalidUserIdError} from "../utils/HttpErrorHandler.util";

const router = Router();

// Prisma
const prismaClient = new PrismaClient();

// Repositories
const usersRepository = new UsersRepository(prismaClient);

// Services
const authService = new AuthService(usersRepository);
const userService = new UserService(usersRepository);

// Controllers
const authController = new AuthController(authService);
const sessionController = new SessionController();
const teacherController = new TeacherController();
const userController = new UserController(userService);

//validate IDs
const validateIdParam: RequestParamHandler = (req, res, next, value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0 || String(id) !== value) {
        return next(new InvalidUserIdError);
    }
    next();
};

router.param('id', validateIdParam);
router.param('userId', validateIdParam);

// Auth routes (public)
router.post('/api/auth/login', validate(LoginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/api/auth/register', validate(RegisterSchema), asyncHandler((req, res) => authController.register(req, res)));

// Session routes (protected)
router.get('/api/session', authMiddleware, asyncHandler((req, res) => sessionController.getAll(req, res)));
router.get('/api/session/:id', authMiddleware, asyncHandler((req, res) => sessionController.getById(req, res)));
router.post('/api/session', authMiddleware, asyncHandler((req, res) => sessionController.create(req, res)));
router.put('/api/session/:id', authMiddleware, asyncHandler((req, res) => sessionController.update(req, res)));
router.delete('/api/session/:id', authMiddleware, asyncHandler((req, res) => sessionController.delete(req, res)));
router.post('/api/session/:id/participate/:userId', authMiddleware,asyncHandler((req, res) => sessionController.participate(req, res)));
router.delete('/api/session/:id/participate/:userId', authMiddleware, asyncHandler((req, res) => sessionController.unparticipate(req, res)));

// Teacher routes (protected)
router.get('/api/teacher', authMiddleware, asyncHandler((req, res) => teacherController.getAll(res)));
router.get('/api/teacher/:id', authMiddleware, asyncHandler((req, res) => teacherController.getById(req, res)));

// User routes (protected)
router.get('/api/user/:id', authMiddleware, asyncHandler((req, res) => userController.getById(req, res)));
router.post('/api/user/promote-admin', authMiddleware, asyncHandler((req, res) =>
  userController.promoteSelfToAdmin(req, res),
));
router.delete('/api/user/:id', authMiddleware, asyncHandler((req, res) => userController.delete(req, res)));

export default router;
