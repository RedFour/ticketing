import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useAuthContext } from '../context/auth-context';

interface NavHeaderProps {}

const NavHeader = (navHeaderProps: NavHeaderProps) => {
  const { currentUser } = useAuthContext();

  const linkConfigs = currentUser
    ? [
        { label: 'Sign Out', href: '/auth/signout' },
        { label: 'Sell Tickets', href: '/tickets/new' },
        { label: 'My Orders', href: '/orders' },
      ]
    : [
        { label: 'Sign Up', href: '/auth/signup' },
        { label: 'Sign In', href: '/auth/signin' },
      ];

  const links = linkConfigs.map(({ label, href }) => {
    return (
      <li key={href}>
        <Link href={href}>
          <a className="nav-link">{label}</a>
        </Link>
      </li>
    );
  });

  return (
    <Wrapper {...navHeaderProps}>
      <nav className="navbar navbar-light bg-light">
        <Link href="/">
          <a className="navbar-brand">GitTix</a>
        </Link>
        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center">{links}</ul>
        </div>
      </nav>
    </Wrapper>
  );
};

const Wrapper = styled.div<NavHeaderProps>``;

export default NavHeader;
