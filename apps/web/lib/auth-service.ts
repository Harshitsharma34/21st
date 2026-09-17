import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt. For now, using crypto for hashing
    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 100000;
    const keylen = 64;
    const digest = 'sha512';

    const hash = crypto
      .pbkdf2Sync(password, salt, iterations, keylen, digest)
      .toString('hex');

    return `${salt}$${hash}`;
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, storedHash] = hash.split('$');
    if (!salt || !storedHash) return false;

    const keylen = 64;
    const iterations = 100000;
    const digest = 'sha512';

    const computedHash = crypto
      .pbkdf2Sync(password, salt, iterations, keylen, digest)
      .toString('hex');

    return computedHash === storedHash;
  }

  static generateVerificationCode(): string {
    return Math.random().toString().substring(2, 8).padStart(6, '0');
  }

  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Sign Up with Email
  static async signupEmail(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('auth_users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
      })
      .select('id')
      .single();

    if (userError || !user) {
      throw new Error('Failed to create user');
    }

    // Generate verification code
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const { error: codeError } = await supabase
      .from('email_verifications')
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (codeError) {
      throw new Error('Failed to generate verification code');
    }

    return {
      userId: user.id,
      email,
      requiresVerification: true,
    };
  }

  // Verify Email
  static async verifyEmail(email: string, code: string) {
    const { data: user } = await supabase
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const { data: verification, error: verifyError } = await supabase
      .from('email_verifications')
      .select()
      .eq('user_id', user.id)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verifyError || !verification) {
      throw new Error('Invalid or expired verification code');
    }

    // Mark code as used
    await supabase
      .from('email_verifications')
      .update({ used: true })
      .eq('id', verification.id);

    // Mark user email as verified
    await supabase
      .from('auth_users')
      .update({ email_verified: true })
      .eq('id', user.id);

    // Create session
    return this.createSession(user.id);
  }

  // Login with Email
  static async loginEmail(email: string, password: string) {
    const { data: user } = await supabase
      .from('auth_users')
      .select()
      .eq('email', email)
      .single();

    if (!user || !user.password_hash) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return this.createSession(user.id);
  }

  // Login or Create with Google
  static async loginGoogle(googleId: string, email: string, name?: string) {
    // Check if user exists with Google ID
    const { data: existingUser } = await supabase
      .from('auth_users')
      .select()
      .eq('google_id', googleId)
      .single();

    if (existingUser) {
      return this.createSession(existingUser.id);
    }

    // Check if email exists
    const { data: emailUser } = await supabase
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    if (emailUser) {
      // Link Google ID to existing account
      await supabase
        .from('auth_users')
        .update({ google_id: googleId })
        .eq('id', emailUser.id);

      return this.createSession(emailUser.id);
    }

    // Create new user
    const [firstName, lastName] = name?.split(' ') ?? [undefined, undefined];
    const { data: newUser, error } = await supabase
      .from('auth_users')
      .insert({
        email,
        google_id: googleId,
        first_name: firstName,
        last_name: lastName,
        email_verified: true, // Google verified emails
      })
      .select('id')
      .single();

    if (error || !newUser) {
      throw new Error('Failed to create user');
    }

    return this.createSession(newUser.id);
  }

  // Login or Create with GitHub
  static async loginGitHub(githubId: string, email: string, username?: string) {
    // Check if user exists with GitHub ID
    const { data: existingUser } = await supabase
      .from('auth_users')
      .select()
      .eq('github_id', githubId)
      .single();

    if (existingUser) {
      return this.createSession(existingUser.id);
    }

    // Check if email exists
    const { data: emailUser } = await supabase
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    if (emailUser) {
      // Link GitHub ID to existing account
      await supabase
        .from('auth_users')
        .update({ github_id: githubId })
        .eq('id', emailUser.id);

      return this.createSession(emailUser.id);
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('auth_users')
      .insert({
        email,
        github_id: githubId,
        first_name: username,
        email_verified: true, // GitHub verified emails
      })
      .select('id')
      .single();

    if (error || !newUser) {
      throw new Error('Failed to create user');
    }

    return this.createSession(newUser.id);
  }

  // Forgot Password
  static async requestPasswordReset(email: string) {
    const { data: user } = await supabase
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return { success: true, message: 'If email exists, reset code has been sent' };
    }

    // Generate reset code
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const { error } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      throw new Error('Failed to generate reset code');
    }

    return { success: true, code, userId: user.id }; // In production, send code via email
  }

  // Reset Password
  static async resetPassword(email: string, code: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const { data: user } = await supabase
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const { data: resetRecord } = await supabase
      .from('password_resets')
      .select()
      .eq('user_id', user.id)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!resetRecord) {
      throw new Error('Invalid or expired reset code');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('auth_users')
      .update({ password_hash: passwordHash })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('Failed to reset password');
    }

    // Mark reset code as used
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetRecord.id);

    return { success: true, message: 'Password reset successfully' };
  }

  // Create Session
  static async createSession(userId: string) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    const { error } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      throw new Error('Failed to create session');
    }

    // Fetch user data
    const { data: user } = await supabase
      .from('auth_users')
      .select('id, email, first_name, last_name, avatar_url, email_verified')
      .eq('id', userId)
      .single();

    return {
      sessionToken: token,
      user: user,
    };
  }

  // Verify Session
  static async verifySession(token: string) {
    const { data: session } = await supabase
      .from('auth_sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      throw new Error('Invalid or expired session');
    }

    const { data: user } = await supabase
      .from('auth_users')
      .select('id, email, first_name, last_name, avatar_url, email_verified')
      .eq('id', session.user_id)
      .single();

    return user;
  }

  // Logout
  static async logout(token: string) {
    const { error } = await supabase
      .from('auth_sessions')
      .delete()
      .eq('token', token);

    if (error) {
      throw new Error('Failed to logout');
    }

    return { success: true };
  }
}
