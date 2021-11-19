import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';
import buildClient from '../api/build-client';
import { CurrentUser } from '../interfaces/current-user';
import { Ticket } from '../interfaces/ticket';

const Title = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Home = ({
  currentUser,
  tickets,
}: {
  currentUser: CurrentUser;
  tickets: Ticket[];
}) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { data } = await buildClient(context.req).get<Ticket[]>(
      '/api/tickets'
    );

    return { props: { tickets: data } };
  } catch (error) {
    console.log('Error: ', error);
    return { props: { tickets: [] } };
  }
};

export default Home;
