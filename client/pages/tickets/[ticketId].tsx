import { GetServerSideProps } from 'next';
import Router from 'next/router';
import React from 'react';
import styled from 'styled-components';
import buildClient from '../../api/build-client';
import { useRequest } from '../../hooks/use-request';
import { Ticket } from '../../interfaces/ticket';

interface TicketShowProps {
  ticket: Ticket;
}

const TicketShow = (ticketShowProps: TicketShowProps) => {
  const { ticket } = ticketShowProps;

  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'POST',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <Wrapper {...ticketShowProps}>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </Wrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { ticketId } = context.query;

  try {
    const { data } = await buildClient(context.req).get<Ticket>(
      `/api/tickets/${ticketId}`
    );

    return { props: { ticket: data } };
  } catch (error) {
    console.log('Error: ', error);
    return { props: { ticket: {} } };
  }
};

const Wrapper = styled.div<TicketShowProps>``;

export default TicketShow;
