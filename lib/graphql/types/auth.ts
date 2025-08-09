import { objectType, inputObjectType, mutationType, extendType, arg, nonNull, stringArg, booleanArg } from 'nexus';

// Auth Types
export const AuthTokens = objectType({
  name: 'AuthTokens',
  definition(t) {
    t.nonNull.string('accessToken');
    t.nonNull.string('refreshToken');
    t.nonNull.int('expiresIn');
  }
});

export const AuthResponse = objectType({
  name: 'AuthResponse',
  definition(t) {
    t.field('user', { type: 'User' });
    t.field('tokens', { type: 'AuthTokens' });
    t.nonNull.string('message');
  }
});

export const LoginInput = inputObjectType({
  name: 'LoginInput',
  definition(t) {
    t.string('email');
    t.string('phone');
    t.string('username');
    t.nonNull.string('password');
    t.string('provider');
  }
});

export const RegisterInput = inputObjectType({
  name: 'RegisterInput',
  definition(t) {
    t.string('email');
    t.string('phone');
    t.string('username');
    t.string('password');
    t.nonNull.string('displayName');
    t.string('provider');
    t.string('googleId');
    t.string('facebookId');
    t.string('appleId');
  }
});

export const OTPInput = inputObjectType({
  name: 'OTPInput',
  definition(t) {
    t.string('email');
    t.string('phone');
    t.nonNull.string('otpCode');
  }
});

export const RefreshTokenInput = inputObjectType({
  name: 'RefreshTokenInput',
  definition(t) {
    t.nonNull.string('refreshToken');
  }
});

// Extend Mutation with Auth operations
export const AuthMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('login', {
      type: 'AuthResponse',
      args: {
        input: nonNull(arg({ type: 'LoginInput' })),
      },
      resolve: async (_parent, { input }, ctx) => {
        const { authService } = await import('@/lib/auth/unified-auth.service');
        
        try {
          const result = await authService.login({
            email: input.email,
            phone: input.phone,
            username: input.username,
            password: input.password,
            provider: input.provider || 'email'
          });

          return {
            user: result.user,
            tokens: result.tokens,
            message: 'Login successful'
          };
        } catch (error: any) {
          throw new Error(error.message || 'Login failed');
        }
      }
    });

    t.field('register', {
      type: 'AuthResponse',
      args: {
        input: nonNull(arg({ type: 'RegisterInput' })),
      },
      resolve: async (_parent, { input }, ctx) => {
        const { authService } = await import('@/lib/auth/unified-auth.service');
        
        try {
          // Validate required fields
          if (!input.displayName) {
            throw new Error('Display name is required');
          }

          if (!input.email && !input.phone && !input.username) {
            throw new Error('Email, phone, or username is required');
          }

          if (input.provider === 'email' && !input.password) {
            throw new Error('Password is required for email registration');
          }

          const result = await authService.register({
            email: input.email,
            phone: input.phone,
            username: input.username,
            password: input.password,
            displayName: input.displayName,
            provider: input.provider || 'email',
            googleId: input.googleId,
            facebookId: input.facebookId,
            appleId: input.appleId,
          });

          return {
            user: result.user,
            tokens: result.tokens,
            message: 'Registration successful'
          };
        } catch (error: any) {
          throw new Error(error.message || 'Registration failed');
        }
      }
    });

    t.field('refreshTokens', {
      type: 'AuthResponse', 
      args: {
        input: nonNull(arg({ type: 'RefreshTokenInput' })),
      },
      resolve: async (_parent, { input }, ctx) => {
        const { authService } = await import('@/lib/auth/unified-auth.service');
        
        try {
          const result = await authService.refreshToken(input.refreshToken);

          return {
            user: result.user,
            tokens: result.tokens,
            message: 'Token refreshed successfully'
          };
        } catch (error: any) {
          throw new Error('Invalid refresh token');
        }
      }
    });

    t.field('sendOTP', {
      type: 'String',
      args: {
        identifier: nonNull(stringArg()), // email or phone
      },
      resolve: async (_parent, { identifier }, ctx) => {
        const { authService } = await import('@/lib/auth/unified-auth.service');
        
        try {
          await authService.sendOTP(identifier);
          return 'OTP sent successfully';
        } catch (error: any) {
          throw new Error(error.message || 'Failed to send OTP');
        }
      }
    });

    t.field('verifyOTP', {
      type: 'AuthResponse',
      args: {
        identifier: nonNull(stringArg()), // email or phone
        otpCode: nonNull(stringArg()),
      },
      resolve: async (_parent, { identifier, otpCode }, ctx) => {
        const { authService } = await import('@/lib/auth/unified-auth.service');
        
        try {
          const result = await authService.verifyOTP(identifier, otpCode);

          return {
            user: result.user,
            tokens: result.tokens,
            message: 'OTP verified successfully'
          };
        } catch (error: any) {
          throw new Error(error.message || 'OTP verification failed');
        }
      }
    });

    t.field('logout', {
      type: 'String',
      resolve: async (_parent, _args, ctx) => {
        // In a real implementation, you might want to blacklist the token
        // For now, we just return a success message
        return 'Logout successful';
      }
    });
  }
});

// Auth Queries
export const AuthQueries = extendType({
  type: 'Query',
  definition(t) {
    t.field('me', {
      type: 'User',
      resolve: async (_parent, _args, ctx) => {
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }

        return ctx.dataloaders.userById.load(ctx.user.id);
      }
    });

    t.boolean('isAuthenticated', {
      resolve: async (_parent, _args, ctx) => {
        return !!ctx.user;
      }
    });
  }
});
