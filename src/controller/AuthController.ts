import * as bcrypt from 'bcryptjs';
import { getCustomRepository } from 'typeorm';
import UserRepository from '../repository/UserRepository';
import RefreshTokenRepository from '../repository/RefreshTokenRepository';

class AuthController {
  userRepository = getCustomRepository(UserRepository);

  refreshTokenRepository = getCustomRepository(RefreshTokenRepository);

  private setTokenCookie = (res, refreshToken) => {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);
  }

  async authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;

    await this.userRepository.authenticate({ email, password, ipAddress })
      .then(({ refreshToken, ...account }) => {
        this.setTokenCookie(res, refreshToken);

        res.json({
          status: 'success',
          message: 'Login successful',
          data: account,
        });
      })
      .catch(next);
  }

  async refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;

    await this.userRepository.refreshToken({ token, ipAddress })
      .then(({ refreshToken, ...account }) => {
        this.setTokenCookie(res, refreshToken);

        res.json({
          status: 'success',
          message: 'Token refreshed',
          data: account,
        });
      })
      .catch(next);
  }

  async revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) {
      res.status(400).json({ message: 'Token is required' });

      return;
    }

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== 0) {
      res.status(401).json({ message: 'Unauthorized' });

      return;
    }

    await this.refreshTokenRepository.revokeToken({ token, ipAddress })
      .then(() => {
        res.json({
          status: 'success',
          message: 'Token revoked',
        });
      })
      .catch(next);
  }

  async register(req, res, next) {
    req.body.password = bcrypt.hashSync(req.body.password, 10);

    await this.userRepository
      .register(req.body, req.get('origin'))
      .then(({ message }) => {
        res.json({
          status: 'success',
          message,
        });
      })
      .catch(next);
  }

  async verifyEmail(req, res, next) {
    await this.userRepository.verifyEmail(req.body)
      .then(() => {
        res.json({
          status: 'success',
          message: 'Verification successful, you can now login',
        });
      })
      .catch(next);
  }

  async forgotPassword(req, res, next) {
    await this.userRepository.forgotPassword(req.body, req.get('origin'))
      .then(() => {
        res.json({
          status: 'success',
          message: 'Please check your email for password reset instructions',
        });
      })
      .catch(next);
  }

  async resetPassword(req, res, next) {
    await this.userRepository.resetPassword(req.body)
      .then(() => {
        res.json({
          status: 'success',
          message: 'Password reset successful, you can now login',
        });
      })
      .catch(next);
  }

  async getUserProfile(req, res, next) {
    const { id } = req.user;

    await this.userRepository.findOne(id)
      .then((user) => {
        res.json({
          status: 'success',
          data: {
            user,
          },
        });
      })
      .catch(next);
  }
}

export default AuthController;
