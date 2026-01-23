import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositary/userrepo.js';

class UserUsecase {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async registerUser(userData) {
        try {

            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);

            // Create user
            const user = await this.userRepository.create(userData);

            // Generate JWT token
            const token = this.generateToken(user._id, user.role);

            return {
                success: true,
                data: {
                    user,
                    token
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async loginUser(email, password) {
        try {

            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }


            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            // Check if user is active
            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }

            // Generate token
            const token = this.generateToken(user._id, user.role);

            return {
                success: true,
                data: {
                    user,
                    token
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getUsers(filters = {}, options = {}) {
        try {
            const users = await this.userRepository.find(filters, options);
            const total = await this.userRepository.count(filters);

            return {
                success: true,
                data: {
                    users,
                    pagination: {
                        page: options.page || 1,
                        limit: options.limit || 10,
                        total,
                        pages: Math.ceil(total / (options.limit || 10))
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getUserById(id) {
        try {
            const user = await this.userRepository.findById(id);
            console.log(user);
            if (!user) {
                throw new Error('User not found');
            }

            return {
                success: true,
                data: { user }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateUser(id, updateData, currentUserId, currentUserRole) {
        try {
            
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                throw new Error('User not found');
            }

            // Authorization check (users can update their own profile, admins can update anyone)
            if (currentUserRole !== 'admin' && id !== currentUserId.toString()) {
                throw new Error('Unauthorized to update this user');
            }

            // Prevent role change for non-admins
            if (currentUserRole !== 'admin' && updateData.role) {
                delete updateData.role;
            }

            // Hash password if it's being updated
            if (updateData.password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(updateData.password, salt);
            }

            const updatedUser = await this.userRepository.update(id, updateData);

            return {
                success: true,
                data: { user: updatedUser }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteUser(id, currentUserId, currentUserRole) {
        try {
            // Check if user exists
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                throw new Error('User not found');
            }

            // Authorization check (users can delete their own account, admins can delete anyone)
            if (currentUserRole !== 'admin' && id !== currentUserId.toString()) {
                throw new Error('Unauthorized to delete this user');
            }

            // Prevent self-deletion for admins (optional safety check)
            if (currentUserRole === 'admin' && id === currentUserId.toString()) {
                throw new Error('Admins cannot delete their own account');
            }

            await this.userRepository.delete(id);

            return {
                success: true,
                message: 'User deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    generateToken(userId, role) {
        return jwt.sign(
            { userId, role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
    }
}

export default UserUsecase;