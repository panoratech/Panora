import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Res,
  Query,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyDto } from './dto/api-key.dto';
import { StytchService } from './stytch.service';
import {
  AuthSsoSmsMfaDto,
  DeleteMemberDto,
  DiscoveryCreateDto,
  DiscoveryStartDto,
  InviteDto,
  LoginDto,
  SendSsoSmsDto,
  SsoCreateDto,
  SsoOidcUpdateDto,
  SsoSamlUpdateDto,
} from './dto/stytch.dto';
import { EnvironmentService } from '@@core/environment/environment.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly stytchService: StytchService,
    private readonly env: EnvironmentService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AuthController.name);
  }

  /*STYTCH*/

  @ApiOperation({ operationId: 'login', summary: 'Login' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/login')
  async stytchLogin(@Body() user: LoginDto) {
    return this.stytchService.login(user);
  }

  @ApiOperation({ operationId: 'logout', summary: 'Logout' })
  @ApiResponse({ status: 201 })
  @Get('stytch/logout')
  async stytchLogout(@Req() req: Request, @Res() res: Response) {
    // revoke cookie sessions
    const sessionJWT = req.cookies['session'];
    if (!sessionJWT) {
      return;
    }
    await this.stytchService.logout(sessionJWT);
    // Delete the session cookie by setting maxAge to 0
    res.cookie('session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0, // Expires after 24 hours
    });
    return res.redirect(307, `${this.env.getWebappUrl()}/login`);
  }

  @ApiOperation({ operationId: 'invite', summary: 'Invite' })
  @ApiBody({ type: InviteDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/invite')
  async stytchInvite(@Body() user: InviteDto) {
    return this.stytchService.invite(user);
  }

  @ApiOperation({ operationId: 'deleteMember', summary: 'Delete Member' })
  @ApiBody({ type: DeleteMemberDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/deleteMember')
  async stytchDeleteMember(@Body() user: DeleteMemberDto) {
    return this.stytchService.deleteMember(user);
  }

  @ApiOperation({ operationId: 'createSsoOidc', summary: 'CreateSsoOidc' })
  @ApiBody({ type: SsoCreateDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/sso/oidc/create')
  async stytchSsoOidcCreate(@Body() user: SsoCreateDto) {
    return this.stytchService.createSsoOidc(user);
  }

  @ApiOperation({ operationId: 'updateSsoOidc', summary: 'UpdateSsoOidc' })
  @ApiBody({ type: SsoOidcUpdateDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/sso/oidc/update')
  async stytchSsoOidcUpdate(
    @Body()
    data: SsoOidcUpdateDto,
  ) {
    return this.stytchService.updateSsoOidc(data);
  }

  @ApiOperation({ operationId: 'createSsoSaml', summary: 'CreateSsoSaml' })
  @ApiBody({ type: SsoCreateDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/sso/saml/create')
  async stytchSsoSamlCreate(@Body() user: SsoCreateDto) {
    return this.stytchService.createSsoSaml(user);
  }

  @ApiOperation({ operationId: 'updateSsoSaml', summary: 'UpdateSsoSaml' })
  @ApiBody({ type: SsoSamlUpdateDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/sso/saml/update')
  async stytchSsoSamlUpdate(
    @Body()
    data: SsoSamlUpdateDto,
  ) {
    return this.stytchService.updateSsoSaml(data);
  }

  @ApiOperation({ operationId: 'sendSsoSms', summary: 'SendSsoSms' })
  @ApiBody({ type: SendSsoSmsDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/smsmfa/send')
  async stytchSsoSmsMfaSend(@Body() user: SendSsoSmsDto) {
    return this.stytchService.sendSsoSms(user);
  }

  @ApiOperation({
    operationId: 'authenticateSmsMfa',
    summary: 'AuthenticateSmsMfa',
  })
  @ApiBody({ type: AuthSsoSmsMfaDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/smsmfa/authenticate')
  async stytchSsoSmsMfaAuthenticate(@Body() user: AuthSsoSmsMfaDto) {
    return this.stytchService.authSsoSmsMfa(user);
  }

  @ApiOperation({
    operationId: 'discoveryOrganization',
    summary: 'DiscoveryOrganization',
  })
  @ApiResponse({ status: 201 })
  @Get('stytch/discovery/:orgId')
  async stytchDiscovery(
    @Req() req: Request,
    @Res() res: Response,
    @Param('orgId') id: string,
  ) {
    try {
      const result = await this.stytchService.discoveryOrg(id, req);
      if ('redirect' in result) {
        return res.redirect(
          result.redirect.statusCode,
          `${this.env.getWebappUrl()}/${result.redirect.destination}`,
        );
      }
      const {
        session_jwt,
        organization,
        member,
        intermediate_session_token,
        mfa_required,
      } = result;

      if (session_jwt === '') {
        res.cookie('intermediate_session', intermediate_session_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000, // Expires after 24 hours
        });
        res.cookie('session', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 0,
        });
        if (
          mfa_required != null &&
          mfa_required.secondary_auth_initiated == 'sms_otp'
        ) {
          // An OTP code is automatically sent if Stytch knows the member's phone number
          return res.redirect(
            302,
            `${this.env.getWebappUrl()}/${
              organization.organization_slug
            }/smsmfa?sent=true&org_id=${
              organization.organization_id
            }&member_id=${member.member_id}`,
          );
        }
        return res.redirect(
          302,
          `${this.env.getWebappUrl()}/${
            organization.organization_slug
          }/smsmfa?sent=false&org_id=${
            organization.organization_id
          }&member_id=${member.member_id}`,
        );
      }
      res.cookie('session', session_jwt, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // Expires after 24 hours,
      });
      res.cookie('intermediate_session', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0,
      });
      return res.redirect(
        307,
        `${this.env.getWebappUrl()}/${
          organization.organization_slug
        }/dashboard`,
      );
    } catch (error) {
      res.redirect(307, `${this.env.getWebappUrl()}/discovery`);
    }
  }

  @ApiOperation({ operationId: 'startDiscovery', summary: 'StartDiscovery' })
  @ApiBody({ type: DiscoveryStartDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/discovery/start')
  async stytchDiscoveryStart(@Body() user: DiscoveryStartDto) {
    return this.stytchService.startDiscovery(user);
  }

  @ApiOperation({ operationId: 'createDiscovery', summary: 'CreateDiscovery' })
  @ApiBody({ type: DiscoveryCreateDto })
  @ApiResponse({ status: 201 })
  @Post('stytch/discovery/create')
  async stytchDiscoveryCreate(
    @Res() res: Response,
    @Body() user: DiscoveryCreateDto,
  ) {
    const { member, organization, session_jwt, intermediate_session_token } =
      await this.stytchService.createDiscovery(user);
    if (session_jwt === '') {
      res.cookie('intermediate_session', intermediate_session_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // Expires after 24 hours
      });
      res.cookie('session', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0,
      });
      return res.redirect(
        302,
        `${this.env.getWebappUrl()}/${
          organization.organization_slug
        }/smsmfa?sent=false&org_id=${organization.organization_id}&member_id=${
          member.member_id
        }`,
      );
    }
    res.cookie('intermediate_session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
    });
    res.cookie('session', session_jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // Expires after 24 hours
    });
    return res.redirect(307, `/${organization.organization_slug}/dashboard`);
  }

  @ApiOperation({ operationId: 'callback', summary: 'Callback' })
  @ApiResponse({ status: 200 })
  @Get('stytch/callback')
  async stytchCallback(
    @Res() res: Response,
    @Query('slug') slug: string,
    @Query('stytch_token_type') stytch_token_type: string,
    @Query('token') token: string,
  ) {
    const result = await this.stytchService.handleCallback(
      slug,
      stytch_token_type,
      token,
    );
    // TODO: Should we return the slug here?
    if (result.kind === 'login') {
      res.cookie('session', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // Expires after 24 hours
      });
      // Explicitly redirect using the response object
      return res.redirect(`${this.env.getWebappUrl()}/${slug}/dashboard`);
    } else {
      res.cookie('intermediate_session', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // Expires after 24 hours
      });
      return res.redirect(307, `/discovery`);
    }
  }

  @ApiOperation({
    operationId: 'verifyStytchSession',
    summary: 'VerifyStytchSession',
  })
  @ApiResponse({ status: 200 })
  @Get('stytch/session/verify')
  async stytchSessionVerify(@Res() res: Response, @Req() req: Request) {
    const sessionJWT = req.cookies['session'];
    if (!sessionJWT) {
      console.log('No session JWT found...');
      res.redirect(307, `${this.env.getWebappUrl()}/login`);
    }
    try {
      const sessionAuthRes = await this.stytchService.verifySession(sessionJWT);
      return {
        isAuthenticated: true,
        member: sessionAuthRes.member,
      };
    } catch (error) {
      res.redirect(307, `${this.env.getWebappUrl()}/login`);
    }
  }

  @ApiOperation({
    operationId: 'getDiscoveredOrganizations',
    summary: 'GetDiscoveredOrganizations',
  })
  @ApiResponse({ status: 200 })
  @Get('stytch/discovery/organizations')
  async getDiscoveredOrganizations(@Req() req: Request, @Res() res: Response) {
    const sessionData = await this.stytchService.getDiscoverySessionData(req);

    if (sessionData.error) {
      return res.redirect(307, `${this.env.getWebappUrl()}/login`);
    }

    try {
      return await this.stytchService.getDiscoveryOrgs(sessionData);
    } catch (error) {
      console.error('Failed to retrieve organizations', error);
      return res
        .status(500)
        .json({ message: 'Failed to retrieve organizations' });
    }
  }

  /*STYTCH*/

  @ApiOperation({ operationId: 'signUp', summary: 'Register' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201 })
  @Post('register')
  async registerUser(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  @ApiOperation({ operationId: 'getUsers', summary: 'Get users' })
  @ApiResponse({ status: 200 })
  @Get('users')
  async users() {
    return this.authService.getUsers();
  }

  @ApiOperation({ operationId: 'getApiKeys', summary: 'Retrieve API Keys' })
  @ApiResponse({ status: 200 })
  @Get('api-keys')
  async apiKeys() {
    return this.authService.getApiKeys();
  }

  @ApiOperation({ operationId: 'generateApiKey', summary: 'Create API Key' })
  @ApiBody({ type: ApiKeyDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('generate-apikey')
  async generateApiKey(@Body() data: ApiKeyDto): Promise<{ api_key: string }> {
    return this.authService.generateApiKeyForUser(
      data.userId,
      data.projectId,
      data.keyName,
    );
  }
}
