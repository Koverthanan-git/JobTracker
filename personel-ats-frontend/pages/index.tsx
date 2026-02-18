// pages/index.tsx
import dynamic from 'next/dynamic';
import Head from 'next/head';
const App = dynamic(() => import('../src/App'), { ssr: false });

import React from 'react';

export default function Home() {
  return (
    <>
      <Head>
        <title>MyATS — Dashboard</title>
        <meta name="description" content="Applicant tracking and pipeline management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <App />
    </>
  );
}