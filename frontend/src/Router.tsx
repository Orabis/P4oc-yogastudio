import {authService} from "./services/auth.service.ts";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Sessions from "./pages/Sessions.tsx";
import SessionDetail from "./pages/SessionDetail.tsx";
import SessionForm from "./pages/SessionForm.tsx";
import Profile from "./pages/Profile.tsx";
import {ReactNode} from "react";

function PrivateRoute  ({ children } : { children:ReactNode }){
    const isAuthenticated = authService.isAuthenticated();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function Router (){
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Navigate to="/sessions" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/sessions"
                        element={
                            <PrivateRoute>
                                <Sessions />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sessions/:id"
                        element={
                            <PrivateRoute>
                                <SessionDetail />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sessions/create"
                        element={
                            <PrivateRoute>
                                <SessionForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sessions/edit/:id"
                        element={
                            <PrivateRoute>
                                <SessionForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}