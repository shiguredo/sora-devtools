import React from "react";
import { Col, FormCheck, FormGroup, FormLabel, FormSelect, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  setAudio,
  setAudioBitRate,
  setAudioCodecType,
  setAutoGainControl,
  setEchoCancellation,
  setEchoCancellationType,
  setNoiseSuppression,
} from "@/app/slice";
import { AUDIO_BIT_RATES, AUDIO_CODEC_TYPES, ECHO_CANCELLATION_TYPES } from "@/constants";
import { isAudioBitRate, isAudioCodecType, isEchoCancellationType } from "@/utils";

const FormEchoCancellationType: React.FC = () => {
  const echoCancellationType = useAppSelector((state) => state.echoCancellationType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isEchoCancellationType(event.target.value)) {
      dispatch(setEchoCancellationType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellationType">
      <FormLabel>echoCancellationType:</FormLabel>
      <FormSelect name="echoCancellationType" value={echoCancellationType} onChange={onChange}>
        {ECHO_CANCELLATION_TYPES.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};

const FormEchoCancellation: React.FC = () => {
  const echoCancellation = useAppSelector((state) => state.echoCancellation);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEchoCancellation(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="echoCancellation">
      <FormCheck
        type="switch"
        name="echoCancellation"
        label="echoCancellation"
        checked={echoCancellation}
        onChange={onChange}
      />
    </FormGroup>
  );
};

const FormNoiseSuppression: React.FC = () => {
  const noiseSuppression = useAppSelector((state) => state.noiseSuppression);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setNoiseSuppression(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="noiseSuppression">
      <FormCheck
        type="switch"
        name="noiseSuppression"
        label="noiseSuppression"
        checked={noiseSuppression}
        onChange={onChange}
      />
    </FormGroup>
  );
};

const FormAutoGainControl: React.FC = () => {
  const autoGainControl = useAppSelector((state) => state.autoGainControl);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAutoGainControl(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="autoGainControl">
      <FormCheck
        type="switch"
        name="autoGainControl"
        label="autoGainControl"
        checked={autoGainControl}
        onChange={onChange}
      />
    </FormGroup>
  );
};

const FormAudioCodecType: React.FC = () => {
  const audioCodecType = useAppSelector((state) => state.audioCodecType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioCodecType(event.target.value)) {
      dispatch(setAudioCodecType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioBitRate">
      <FormLabel>audioCodecType:</FormLabel>
      <FormSelect name="audioCodecType" value={audioCodecType} onChange={onChange}>
        {AUDIO_CODEC_TYPES.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};

const FormAudioBitRate: React.FC = () => {
  const audioBitRate = useAppSelector((state) => state.audioBitRate);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioBitRate(event.target.value)) {
      dispatch(setAudioBitRate(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="audioBitRate">
      <FormLabel>audioBitRate:</FormLabel>
      <FormSelect name="audioBitRate" value={audioBitRate} onChange={onChange}>
        {AUDIO_BIT_RATES.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};

export const FormAudio: React.FC = () => {
  const audio = useAppSelector((state) => state.audio);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudio(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="audio">
      <FormCheck type="switch" name="audio" label="audio" checked={audio} onChange={onChange} />
    </FormGroup>
  );
};

export const FormAudioConstraints: React.FC = () => {
  return (
    <Row className="form-row" xs="auto">
      <Col>
        <FormAudio />
      </Col>
      <Col>
        <FormAudioCodecType />
      </Col>
      <Col>
        <FormAudioBitRate />
      </Col>
      <Col>
        <FormAutoGainControl />
      </Col>
      <Col>
        <FormNoiseSuppression />
      </Col>
      <Col>
        <FormEchoCancellation />
      </Col>
      <Col>
        <FormEchoCancellationType />
      </Col>
    </Row>
  );
};
