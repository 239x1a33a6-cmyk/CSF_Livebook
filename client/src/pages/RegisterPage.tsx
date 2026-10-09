import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(form.name, form.email, form.password);
            navigate('/dashboard');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
            setError(msg || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">⚡</div>
                    <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
                    <p className="text-sm text-gray-500 mt-1">Start your CS learning journey</p>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="form-label">Full name</label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="form-input"
                                placeholder="Your name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="form-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                className="form-input"
                                placeholder="At least 8 characters"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg" role="alert">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="btn-primary w-full btn-lg">
                            {isLoading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
