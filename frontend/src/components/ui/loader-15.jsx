import React from 'react';
import styled from 'styled-components';
import { useLoading } from '../../contexts/LoadingContext';
import { AnimatePresence, motion } from 'framer-motion';

const Loader15 = ({ message }) => {
    return (
        <StyledLoaderContainer>
            <StyledWrapper>
                <div className="loader"></div>
                {message && <div className="message">{message}</div>}
            </StyledWrapper>
        </StyledLoaderContainer>
    );
}

const GlobalLoader15 = () => {
    const { isLoading, loadingMessage } = useLoading();

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99999,
                        background: 'rgba(20, 10, 10, 0.85)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Loader15 message={loadingMessage} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalLoader15;

const StyledLoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  .loader {
    width: 3.5rem;
    height: 3.5rem;
    position: relative;
    border-radius: 50%;
    /* Outer theme color (#5B0E14) with slight transparency */
    border: 4px solid rgba(91, 14, 20, 0.3);
    /* Inner theme color (#F1E194) */
    border-top-color: #F1E194;
    animation: rotate15 1s infinite cubic-bezier(0.5, 0.1, 0.5, 0.9);
  }

  .loader::after {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    border: 4px solid transparent;
    border-bottom-color: #5B0E14;
    animation: rotate15 1.5s infinite linear reverse;
  }

  .message {
    color: #F1E194;
    font-size: 1.1rem;
    font-weight: 500;
    text-align: center;
    max-width: 80%;
    animation: pulse15 2s infinite ease-in-out;
  }

  @keyframes rotate15 {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse15 {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;
