import AuthUseCase from '../usecase/authUsecase.js';

class AuthController {
    constructor() {
        this.authUseCase = new AuthUseCase();
    }

    // Google Login
    googleLogin = async (req, res) => {
        try {
            const { token } = req.body;
            
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Google token is required'
                });
            }

            const result = await this.authUseCase.googleLogin(token);

            return res.status(200).json({
                success: true,
                message: 'Google login successful',
                data: result.data
            });
        } catch (error) {
            console.error('Google login error:', error);
            return res.status(401).json({
                success: false,
                message: error.message || 'Google login failed'
            });
        }
    };

    // Apple Login
    appleLogin = async (req, res) => {
        try {
            const { code, id_token, user } = req.body;
            
            if (!id_token) {
                return res.status(400).json({
                    success: false,
                    message: 'Apple token is required'
                });
            }

            const result = await this.authUseCase.appleLogin({ code, id_token, user });

            return res.status(200).json({
                success: true,
                message: 'Apple login successful',
                data: result.data
            });
        } catch (error) {
            console.error('Apple login error:', error);
            return res.status(401).json({
                success: false,
                message: error.message || 'Apple login failed'
            });
        }
    };

    // Regular email/password login (if you have it)
    emailLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await this.authUseCase.emailLogin(email, password);

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result.data
            });
        } catch (error) {
            console.error('Email login error:', error);
            return res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    };
}

export default AuthController;