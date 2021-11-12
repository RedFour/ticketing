import { GetServerSideProps } from 'next';
import React from 'react';
import styled from 'styled-components';
import buildClient from '../../api/build-client';
import { Order } from '../../interfaces/order';

interface IndexProps {
  orders: Order[];
}

const OrderIndex = (indexProps: IndexProps) => {
  const { orders } = indexProps;

  return (
    <Wrapper {...indexProps}>
      <ul>
        {orders.map((order) => {
          return (
            <li key={order.id}>
              {order.ticket.title} - {order.status}
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { orderId } = context.query;

  try {
    const { data } = await buildClient(context.req).get<Order[]>(`/api/orders`);

    return { props: { orders: data } };
  } catch (error) {
    console.log('Error: ', error);
    return { props: { orders: [] } };
  }
};

const Wrapper = styled.div<IndexProps>``;

export default OrderIndex;
