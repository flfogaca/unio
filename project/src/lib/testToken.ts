export const setTestToken = (token: string) => {
  localStorage.setItem('token', token);
  window.location.reload();
};

if (typeof window !== 'undefined') {
  (window as { setTestToken?: (token: string) => void }).setTestToken =
    setTestToken;

  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjEwNyIsIkVtcHJlc2EiOiIiLCJQZXJmaWxJZCI6IjIiLCJQbGFubyI6IltdIiwibmJmIjoxNzYzNjAwMzIxLCJleHAiOjE3NjM2MDc1MjEsImlhdCI6MTc2MzYwMDMyMSwiaXNzIjoiVW5pb0dyb3VwIiwiYXVkIjoiVW5pb0dyb3VwQ2xpZW50In0.GvxOYF4ZQvAw29iakJ1nf1z8TpiVKesRWK1oEEG2-2A';

  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', testToken);
  }
}
