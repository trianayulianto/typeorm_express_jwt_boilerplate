import { EntityRepository, Repository } from 'typeorm';
import * as crypto from 'crypto';
import RefreshToken from '../entity/RefreshToken';

@EntityRepository(RefreshToken)
class RefreshTokenRepository extends Repository<RefreshToken> {
  // eslint-disable-next-line class-methods-use-this
  public randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
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

  async revokeToken({ token, ipAddress }) {
    const refreshToken = await this.getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = new Date(Date.now());
    refreshToken.revokedByIp = ipAddress;

    await this.save(refreshToken);
  }
}

export default RefreshTokenRepository;
