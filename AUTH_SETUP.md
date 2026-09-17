# MeetSync Authentication System Setup

This document covers the complete setup for the authentication system including email/password, Google OAuth, GitHub OAuth, and email-based password reset.

## Architecture Overview

### Components
1. **Database** - Supabase PostgreSQL with auth tables
2. **Backend API** - Next.js API routes for auth flows
3. **Frontend** - React components for login, signup, password reset, email verification
4. **OAuth Providers** - Google and GitHub integration
5. **Email Service** - Email code delivery (optional)

## Database Setup

### 1. Run Migrations

Execute the migration file in your Supabase dashboard:

```bash
# SQL Editor → New Query → Execute migration
# /db/migrations/001_auth_schema.sql
```

This creates:
- `auth_users` - User account data
- `email_verifications` - Signup email verification codes
- `password_resets` - Password reset verification codes
- `auth_sessions` - User session tokens

### 2. Enable Row Level Security (Optional)

```sql
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own data
CREATE POLICY "Users can read own data"
  ON auth_users FOR SELECT
  USING (id = auth.uid());
```

## Environment Configuration

### 1. Copy Example to .env.local

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 2. Fill in Supabase Credentials

Get these from your Supabase dashboard → Settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `https://yourdomain.com`
6. Copy Client ID to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. GitHub OAuth Setup

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/auth/github/callback`
   - `https://yourdomain.com/auth/github/callback`
4. Copy Client ID and Client Secret:

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-client-id
```

### 5. Email Configuration (Optional)

For production email delivery:

```env
EMAIL_SERVICE=enabled
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@meetsync.com
```

For Gmail: Use [App Passwords](https://myaccount.google.com/apppasswords) instead of your account password.

## API Routes

### Signup
**POST** `/api/auth/signup`
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Verify Email
**POST** `/api/auth/verify-email`
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Login
**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

### Google Login
**POST** `/api/auth/google`
```json
{
  "idToken": "google-id-token"
}
```

### GitHub Login
**POST** `/api/auth/github`
```json
{
  "code": "github-authorization-code"
}
```

### Forgot Password
**POST** `/api/auth/forgot-password`
```json
{
  "email": "user@example.com"
}
```

### Reset Password
**POST** `/api/auth/reset-password`
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePassword123"
}
```

### Get Current User
**GET** `/api/auth/me`

Returns user object if valid session token in cookie.

### Logout
**POST** `/api/auth/logout`

Clears session cookie and database token.

## Frontend Pages

- `/login` - Email/password login with OAuth options
- `/signup` - Create account with email verification
- `/verify-email` - Enter verification code from email
- `/forgot-password` - Request password reset code
- `/reset-password` - Enter code and set new password
- `/auth/github/callback` - GitHub OAuth callback handler

## Session Management

### Session Token
- Stored in `auth_token` HTTP-only cookie
- Valid for 7 days
- Automatically refreshed on each valid request
- Deleted on logout

### Authentication Middleware

Create `lib/auth-middleware.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './auth-service';

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const user = await AuthService.verifySession(token);
    // Attach user to request for use in route handlers
    request.headers.set('x-user-id', user.id);
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

## Security Considerations

✓ Passwords hashed with PBKDF2-SHA512
✓ Session tokens stored as HTTP-only cookies
✓ CSRF protection via SameSite cookie attribute
✓ Verification codes expire in 1 hour
✓ Email validation before code sending
✓ Rate limiting on auth endpoints (implement in production)
✓ Password minimum 8 characters
✓ OAuth state parameter validation (GitHub)

## Deployment Checklist

- [ ] Run database migrations
- [ ] Set environment variables in production
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set up email service (SendGrid, AWS SES, etc.)
- [ ] Enable HTTPS
- [ ] Configure CORS if separate domain for API
- [ ] Set up rate limiting middleware
- [ ] Enable database backups
- [ ] Monitor auth-related errors
- [ ] Test all auth flows end-to-end

## Testing

### Local Testing
```bash
cd apps/web
npm run dev
# Visit http://localhost:3000/login
```

### Test Accounts
Create test accounts in Supabase directly for quick testing.

### OAuth Testing
Use test apps from Google and GitHub developer consoles.

## Troubleshooting

### "Invalid or expired verification code"
- Code expires after 1 hour
- User must request new code
- Check email in spam folder

### "Failed to create session"
- Check Supabase connection
- Verify auth_sessions table exists
- Check available database connections

### "Google login failed"
- Verify Google Client ID in .env.local
- Check authorized redirect URIs in Google Cloud
- Check browser console for token issues

### "GitHub login failed"
- Verify Client ID and Secret match
- Check authorization callback URL setting
- Verify user has email verified in GitHub

## Next Steps

1. Test all auth flows locally
2. Deploy to staging environment
3. Configure production OAuth apps
4. Set up email service for production
5. Monitor auth metrics and errors
6. Plan email notifications for security events
7. Implement session refresh logic
8. Add two-factor authentication (optional)
