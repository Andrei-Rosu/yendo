import React from 'react';

import Layout from '../components/MyLayout';
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';

const Index = props => (
  <Layout>
    <h1>Batman TV Shows</h1>
    <ul>
      {props.places.map(place => (
        <li key={place.id}>
          <Link href="/p/[id]" as={`/p/${place.id}`}>
            <a>{place.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
);

Index.getInitialProps = async function() {
  const res = await fetch('http://127.0.0.1:3210/api/v1/places');
  const data = await res.json();

  console.log(`Show data fetched. Count: ${data.length}`);

  return {
    places: data.map(entry => entry.place)
  };
};

export default Index;
