import React, { useState } from 'react';
import styled from 'styled-components';
import { useRequest } from '../../hooks/use-request';
import Router from 'next/router';

interface signupProps {}

const Signup = (signupProps: signupProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/users/signup',
    method: 'POST',
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <Wrapper {...signupProps}>
      <form onSubmit={onSubmit}>
        <h1>Sign Up</h1>
        <div className="form-group">
          <label>Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Sign up</button>
      </form>
    </Wrapper>
  );
};

const Wrapper = styled.div<signupProps>``;

export default Signup;
