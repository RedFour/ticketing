import { GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import styled from 'styled-components';
import buildClient from '../../api/build-client';
import { useAuthContext } from '../../context/auth-context';
import { useRequest } from '../../hooks/use-request';
import { Order } from '../../interfaces/order';
import Router from 'next/router';

interface OrderShowProps {
  order: Order;
  orderId: string;
}

const OrderShow = (orderShowProps: OrderShowProps) => {
  const { order, orderId } = orderShowProps;
  const { currentUser } = useAuthContext();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'POST',
    body: {
      orderId: orderId,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt).getTime() - new Date().getTime();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  return (
    <Wrapper {...orderShowProps}>
      {timeLeft < 0 ? (
        <div>Order has expired</div>
      ) : (
        <div>
          Time left to pay {timeLeft} seconds
          <StripeCheckout
            token={({ id }) => doRequest({ token: id })}
            stripeKey="pk_test_51JmoxsFIxrzuxJPmdbugDVoFnwgM1Px8RFxvhrsnY7iEgRWs3DbCrZhPyGawyMg5NtFirirchCOntHlA1ypBYnfD00B6bN8buv"
            amount={order.ticket.price * 100}
            email={currentUser?.email}
          />
          {errors}
        </div>
      )}
    </Wrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { orderId } = context.query;

  try {
    const { data } = await buildClient(context.req).get<Order>(
      `/api/orders/${orderId}`
    );

    return { props: { order: data, orderId: orderId } };
  } catch (error) {
    console.log('Error: ', error);
    return { props: { order: {}, orderId: orderId } };
  }
};

const Wrapper = styled.div<OrderShowProps>``;

export default OrderShow;
