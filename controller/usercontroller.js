import UserUsecase from '../usecase/userusecase.js';

class UserController {
    constructor() {
        this.userUsecase = new UserUsecase();
    }

    register = async (req, res) => {
        try {
            const result = await this.userUsecase.registerUser(req.body);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await this.userUsecase.loginUser(email, password);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: result.data
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    getProfile = async (req, res) => {
        try {
            const result = await this.userUsecase.getUserById(req.user.userId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    updateProfile = async (req, res) => {
        try {
            const result = await this.userUsecase.updateUser(
                req.user.userId,
                req.body,
                req.user.userId,
                req.user.role
            );

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    getAllUsers = async (req, res) => {
        try {
            // Only admins can get all users
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin only.'
                });
            }

            const { page = 1, limit = 10, role, search } = req.query;
            const filters = {};

            if (role) filters.role = role;
            if (search) {
                filters.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            };

            const result = await this.userUsecase.getUsers(filters, options);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    getUserById = async (req, res) => {
        try {
            const result = await this.userUsecase.getUserById(req.params.id);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    updateUser = async (req, res) => {
        try {
            // Only admins can update other users
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin only.'
                });
            }

            const result = await this.userUsecase.updateUser(
                req.params.id,
                req.body,
                req.user.userId,
                req.user.role
            );

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'User updated successfully',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    deleteUser = async (req, res) => {
        try {
            // Only admins can delete users
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin only.'
                });
            }

            const result = await this.userUsecase.deleteUser(
                req.params.id,
                req.user.userId,
                req.user.role
            );

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };
}

export default UserController;