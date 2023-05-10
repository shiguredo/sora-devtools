import React, { useEffect } from 'react';

import { disconnectSora, setMediaDevices } from '@/app/actions';
import { initLyra, setInitialParameter } from '@/app/actions';
import { useAppDispatch } from '@/app/hooks';
import { DebugPane } from '@/components/DebugPane';
import { DevtoolsPane } from '@/components/DevtoolsPane';
import { Footer } from '@/components/Footer';
import { Head } from '@/components/Head';
import { Header } from '@/components/Header';
import { MediacaptureRegionTarget } from '@/components/MediacaptureRegionTarget';

const Devtools: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setInitialParameter());
    dispatch(setMediaDevices());
    dispatch(initLyra());
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <MediacaptureRegionTarget />
      <Head />
      <Header />
      <main role="main">
        <div className="container">
          <div className="row">
            <DevtoolsPane />
            <DebugPane />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default Devtools;
