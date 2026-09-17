'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GitHubIcon } from '@/components/icons/github-icon';

export function OAuthButtons() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleLogin = async (response: any) => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Google login failed');
      }

      router.push('/app/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      alert(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    setIsGitHubLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = 'user:email';

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <div className="space-y-3">
      <div id="google-signin-button">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isGoogleLoading}
          onClick={() => {
            if (window.google) {
              window.google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                { theme: 'outline', size: 'large', width: '100%' }
              );
              window.google.accounts.id.prompt(handleGoogleLogin);
            }
          }}
        >
          {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGitHubLogin}
        disabled={isGitHubLoading}
      >
        <GitHubIcon className="mr-2 h-4 w-4" />
        {isGitHubLoading ? 'Signing in...' : 'Continue with GitHub'}
      </Button>
    </div>
  );
}
