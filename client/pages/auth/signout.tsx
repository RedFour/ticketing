import { useEffect } from 'react';
import { useRequest } from '../../hooks/use-request';

import React from 'react';
import styled from 'styled-components';
import Router from 'next/router';

interface signoutProps {}

const Signout = (signoutProps: signoutProps) => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'POST',
    body: {},
    onSuccess: () => Router.push('/'),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return (
    <Wrapper {...signoutProps}>
      <h1>Signing you out...</h1>
    </Wrapper>
  );
};

const Wrapper = styled.div<signoutProps>``;

export default Signout;
