import './Nav.css'
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { House, Wallet, Crown, Store } from 'lucide-react';

const Nav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Memoiza para evitar recálculos desnecessários
    const currentPath = useMemo(() => {
        return location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '');
    }, [location.pathname]);

    const isActive = (path) => {
        const checkPath = path === '/' ? '/' : path.replace(/\/$/, '');
        return currentPath === checkPath;
    };

    const handleNavClick = (e, path) => {
        e.preventDefault();

        // Só navega se não estiver na página atual
        if (!isActive(path)) {
            navigate(path);
        }
    };

    return (
        <div className="nav">
            <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav3 active' : 'nav3')}>
                <div className='nav-icons'><House />Home</div>
            </NavLink>

            <NavLink
                to="/carteira"
                className={({ isActive }) => (isActive ? 'nav3 active' : 'nav3')}>
                <div className='nav-icons'><Wallet />Carteira</div>
            </NavLink>

            <NavLink
                to="/mercado"
                className={({ isActive }) => (isActive ? 'nav3 active' : 'nav3')}>
                <div className='nav-icons'><Store />Mercado</div>
            </NavLink>

            <NavLink
                to="/torneio"
                className={({ isActive }) => (isActive ? 'nav3 active' : 'nav3')}>
                <div className='nav-icons'><Crown />Torneio</div>
            </NavLink>
        </div>
    )
}

export default Nav;