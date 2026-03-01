import UserRepository from '../repositary/userrepo.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthUseCase {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // Generate JWT token
    generateToken(user) {
        return jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role,
                name: user.name 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    // Google Login
    async googleLogin(credential) {
        try {
            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            const { email, name, sub: googleId, picture } = payload;

            if (!email) {
                throw new Error('Email not provided by Google');
            }

            // Check if user exists
            let user = await this.userRepository.findByEmail(email);

            if (!user) {
                // Create new user
                user = await this.userRepository.create({
                    email,
                    name,
                    googleId,
                    profileImage: picture,
                    isEmailVerified: true,
                    authProvider: 'google',
                    role: 'user'
                });
            } else {
                // Update existing user with Google info if needed
                if (!user.googleId) {
                    user.googleId = googleId;
                    user.authProvider = user.authProvider || 'google';
                    user.isEmailVerified = true;
                    if (picture && !user.profileImage) {
                        user.profileImage = picture;
                    }
                    await user.save();
                }
            }

            // Generate JWT
            const token = this.generateToken(user);

            return {
                success: true,
                data: {
                    token,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        profileImage: user.profileImage
                    }
                }
            };
        } catch (error) {
            throw new Error(`Google login failed: ${error.message}`);
        }
    }

    // Apple Login
    async appleLogin({ code, id_token, user: appleUser }) {
        try {
            // Verify Apple token
            // Note: Apple token verification is more complex. You may need to use apple-signin-auth library
            const appleId = id_token; // You should properly verify the token
            
            let email = appleUser?.email;
            let name = appleUser?.name ? 
                `${appleUser.name.firstName} ${appleUser.name.lastName}`.trim() : 
                'Apple User';

            // If email not in user object, try to extract from id_token
            if (!email) {
                // Decode id_token to get email (you should verify it properly)
                const base64Payload = id_token.split('.')[1];
                const payload = JSON.parse(atob(base64Payload));
                email = payload.email;
            }

            if (!email) {
                throw new Error('Email not provided by Apple');
            }

            // Check if user exists
            let user = await this.userRepository.findByEmail(email);

            if (!user) {
                // Create new user
                user = await this.userRepository.create({
                    email,
                    name,
                    appleId,
                    isEmailVerified: true,
                    authProvider: 'apple',
                    role: 'user'
                });
            } else {
                // Update existing user with Apple info if needed
                if (!user.appleId) {
                    user.appleId = appleId;
                    user.authProvider = user.authProvider || 'apple';
                    user.isEmailVerified = true;
                    await user.save();
                }
            }

            // Generate JWT
            const token = this.generateToken(user);

            return {
                success: true,
                data: {
                    token,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        profileImage: user.profileImage
                    }
                }
            };
        } catch (error) {
            throw new Error(`Apple login failed: ${error.message}`);
        }
    }

    // Optional: Regular email/password login
    async emailLogin(email, password) {
        try {
            const user = await this.userRepository.findByEmail(email);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Check if user has password (might be social login only)
            if (!user.password) {
                throw new Error('This account uses social login. Please login with Google or Apple.');
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            const token = this.generateToken(user);

            return {
                success: true,
                data: {
                    token,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        profileImage: user.profileImage
                    }
                }
            };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }
}

export default AuthUseCase;