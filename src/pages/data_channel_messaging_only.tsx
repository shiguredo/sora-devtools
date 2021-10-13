import React, { useEffect } from "react";

import { useAppSelector } from "@/app/hooks";
import { useAppDispatch } from "@/app/hooks";
import { disconnectSora, setEnabledDataChannelMessaging, setInitialParameter, setMediaDevices } from "@/app/slice";
import { AlertMessages } from "@/components/AlertMessages";
import { Connect } from "@/components/Button/Connect";
import { Disconnect } from "@/components/Button/Disconnect";
import { ColDebug } from "@/components/ColDebug";
import { Footer } from "@/components/Footer";
import { FormRowChannelId } from "@/components/Form/RowChannelId";
import { FormRowOptions } from "@/components/Form/RowOptions";
import { Head } from "@/components/Head";
import { Header } from "@/components/Header";

// DataChannelMessagingOnly は video / audio を一切使用しない特殊仕様なので共通 component を使用しない
const DataChannelMessagingOnly: React.FC = () => {
  const debug = useAppSelector((state) => state.debug);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      setInitialParameter({
        debug: true,
        debugType: "messaging",
        role: "recvonly",
        multistream: true,
        simulcast: false,
        spotlight: false,
        dataChannelSignaling: "true",
        dataChannelMessaging: JSON.stringify(
          [
            {
              label: "#sora-demo",
              direction: "sendrecv",
            },
          ],
          null,
          2
        ),
        audio: false,
        video: false,
        dataChannelMessagingOnly: true,
      })
    );
    dispatch(setMediaDevices());
    dispatch(setEnabledDataChannelMessaging(true));
    return () => {
      dispatch(disconnectSora());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Head title={"data channel messaging only"} />
      <Header pageName="data channel messaging only" />
      <main role="main">
        <div className="container">
          <div className="row">
            <div className={debug ? "col-demo col-6" : "col-demo col-12"}>
              <AlertMessages />
              <FormRowChannelId />
              <FormRowOptions />

              <div className="row">
                <Connect />
                <Disconnect />
              </div>
            </div>
            <ColDebug />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default DataChannelMessagingOnly;
