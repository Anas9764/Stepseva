import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Scroll to top on every route change with a slight delay to ensure render completion
        const timeoutId = setTimeout(() => {
            try {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant',
                });
            } catch (error) {
                window.scrollTo(0, 0);
            }
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
