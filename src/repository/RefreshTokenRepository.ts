import { EntityRepository, Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import RefreshToken from '../entity/RefreshToken';

@EntityRepository(RefreshToken)
class RefreshTokenRepository extends Repository<RefreshToken> {
  // eslint-disable-next-line class-methods-use-this
  private randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
  }

  // eslint-disable-next-line class-methods-use-this
  private async generateJwtToken(account) {
    const token = await jwt.sign(account, process.env.TOKEN_SECRET, { expiresIn: '1d' });

    return token;
  }

  async generateRefreshToken(account, ipAddress) {
    const refreshToken = await this.create();

    refreshToken.user = account;
    refreshToken.token = this.randomTokenString();
    refreshToken.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    refreshToken.createdByIp = ipAddress;

    return refreshToken;
  }

  async getRefreshToken(token) {
    const refreshToken = await this.findOne({ where: { token }, relations: ['user'] });

    if (!refreshToken || !refreshToken.isActive) {
      throw new Error('Invalid token');
    }

    return refreshToken;
  }

  async refreshToken({ token, ipAddress }) {
    const refreshToken = await this.getRefreshToken(token);

    const {
      id, name, email, role,
    } = await refreshToken.user;

    const account = {
      id, name, email, role,
    };

    // replace old refresh token with a new one and save
    const newRefreshToken = await this.generateRefreshToken(account, ipAddress);

    refreshToken.revoked = new Date(Date.now());
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;

    await this.save(refreshToken);
    await this.save(newRefreshToken);

    // generate new jwt
    const accessToken = await this.generateJwtToken(account);

    // return basic details and tokens
    return {
      ...account,
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  async revokeToken({ token, ipAddress }) {
    const refreshToken = await this.getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = new Date(Date.now());
    refreshToken.revokedByIp = ipAddress;

    await this.save(refreshToken);
  }
}

export default RefreshTokenRepository;
