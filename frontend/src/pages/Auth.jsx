import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
                {isLogin ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SignIn fallbackRedirectUrl="/" />
                        <button
                            type="button"
                            className="btn-ghost"
                            style={{ marginTop: '1.5rem', border: 'none', background: 'transparent', padding: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
                            onClick={() => setIsLogin(false)}
                        >
                            Don't have an account? Sign Up
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SignUp fallbackRedirectUrl="/onboarding" />
                        <button
                            type="button"
                            className="btn-ghost"
                            style={{ marginTop: '1.5rem', border: 'none', background: 'transparent', padding: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
                            onClick={() => setIsLogin(true)}
                        >
                            Already have an account? Sign In
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
