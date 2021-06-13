/* eslint-disable class-methods-use-this */
import {
  EntityRepository, Repository, getCustomRepository, getRepository,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import sendMail from '../helper/SendMail';
import User from '../entity/User';
import RefreshTokenRepository from './RefreshTokenRepository';
import PasswordReset from '../entity/PasswordReset';

@EntityRepository(User)
class UserRepository extends Repository<User> {
  private refreshTokenRepository = getCustomRepository(RefreshTokenRepository);

  private passwordResetRepository = getRepository(PasswordReset);

  async authenticate({ email, password, ipAddress }) {
    const account = await this.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!account) {
      throw new Error('Email incorrect');
    }

    if (!account.isVerified && (process.env.EMAIL_MUST_VERIFIED === 'true')) {
      throw new Error('Email not verified');
    }

    const passwordIsValid = bcrypt.compareSync(password, account.password);

    if (!passwordIsValid) {
      throw new Error('Invalid password');
    }

    // authentication successful so generate jwt
    const accessToken = await this.generateJwtToken(account, true);

    // generate refresh token
    const refreshToken = await this.refreshTokenRepository.generateRefreshToken(account, ipAddress);
    await this.refreshTokenRepository.save(refreshToken);

    // return basic details and tokens
    return {
      ...this.basicDetails(account),
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async register(params, origin) {
    // validate
    if (await this.findOne({ where: { email: params.email } })) {
      // send already registered error in email to prevent account enumeration
      await this.sendAlreadyRegisteredEmail(params.email, origin);

      return;
    }

    // first registered account is an admin
    const isFirstAccount = (await this.count()) === 0;

    // create account object
    const account = await this.create({
      ...params,
      role: isFirstAccount ? 0 : 1,
    });

    // save account
    await this.save(account);

    // terminate if email must not verified or EMAIL_MUST_VERIFIED have value false
    if (process.env.EMAIL_MUST_VERIFIED !== 'true') {
      // eslint-disable-next-line consistent-return
      return { message: 'Registration successful, You can now login' };
    }

    // make email token verification
    const token = await this.generateJwtToken(account);

    // send email
    await this.sendVerificationEmail({ ...account, token }, origin);

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line consistent-return
      return {
        message: 'Registration successful, please check your email for verification instructions',
        token,
      };
    }

    // eslint-disable-next-line consistent-return
    return { message: 'Registration successful, please check your email for verification instructions' };
  }

  async verifyEmail({ token }) {
    const account = await this.validateToken({ token });

    // check if email already verified
    if (account.isVerified) {
      throw new Error('Email is verified');
    }

    // update verifiedAt
    account.verifiedAt = new Date(Date.now());

    await this.save(account);
  }

  async forgotPassword({ email }, origin) {
    const account = await this.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!account) return;

    const token = await this.generateJwtToken(account);

    // eslint-disable-next-line
    await this.passwordResetRepository.save({ email: account.email, token });

    // send email
    await this.sendPasswordResetEmail({ ...account, token }, origin);

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line consistent-return
      return {
        message: 'Please check your email for password reset instructions',
        token,
      };
    }

    // eslint-disable-next-line consistent-return
    return { message: 'Please check your email for password reset instructions' };
  }

  async resetPassword({ token, password }) {
    const account = await this.validateToken({ token });

    const isValidToken = await this.passwordResetRepository.findOne({
      where: { email: account.email, token },
    });

    if (!isValidToken) {
      throw new Error('Invalid token or token already used');
    }

    // delete password reset token for not to be used more then once
    await this.passwordResetRepository.remove(isValidToken);

    // update password
    account.password = await bcrypt.hash(password, 10);
    account.passwordReset = new Date(Date.now());

    await this.save(account);
  }

  // helper
  private async validateToken({ token }) {
    const { id } = await this.decodeJwtToken(token);

    const account = await this.findOne({ where: { id } });

    if (!account) throw new Error('User not found');

    return account;
  }

  private async generateJwtToken(account, authenticate = false) {
    const userData = authenticate ? this.basicDetails(account) : { id: account.id };

    const token = await jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: '1d' });

    return token;
  }

  private async decodeJwtToken(token) {
    const decode = await jwt.verify(token, process.env.TOKEN_SECRET, (e, d) => {
      if (e) {
        throw new Error(e);
      }

      return d;
    });

    // User registered in time
    return (<any>decode);
  }

  private async sendAlreadyRegisteredEmail(email, origin) {
    let message;

    if (origin) {
      message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
      message = '<p>If you don\'t know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>';
    }

    await sendMail({
      to: email,
      subject: 'Sign-up Verification API - Email Already Registered',
      html: `<h4>Email Already Registered</h4>\n\n<p>Hi, Dears.</p>\n<p>Your email <strong>${email}</strong> is already registered.</p>\n${message}`,
    });
  }

  private async sendVerificationEmail(account, origin) {
    let message;

    if (origin) {
      const verifyUrl = `${origin}/account/verify-email?token=${account.token}`;
      message = `<p>Please click the below link to verify your email address:</p>\n<p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
      message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>\n<p><code>${account.token}</code></p>`;
    }

    await sendMail({
      to: account.email,
      subject: 'Sign-up Verification API - Verify Email',
      html: `<h4>Verify Email</h4>\n\n<p>Hi, ${account.name}.</p>\n<p>Thanks for registering!</p>\n${message}`,
    });
  }

  private async sendPasswordResetEmail(account, origin) {
    let message;

    if (origin) {
      const resetUrl = `${origin}/account/reset-password?token=${account.token}`;
      message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>\n<p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
      message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>\n<p><code>${account.token}</code></p>`;
    }

    await sendMail({
      to: account.email,
      subject: 'Sign-up Verification API - Reset Password',
      html: `<h4>Reset Password Email</h4>\n\n<p>Hi, ${account.name}.</p>\n${message}`,
    });
  }

  private basicDetails(account) {
    const {
      id, name, email, role,
    } = account;

    return {
      id, name, email, role,
    };
  }
}

export default UserRepository;
