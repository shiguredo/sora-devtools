import React from "react";

type Props = {
  mute: boolean;
};
const IconCamera: React.FC<Props> = (props) => {
  if (props.mute) {
    return (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 16 16"
        className="bi bi-camera-video-off-fill"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1.429 3.55A1.66 1.66 0 0 0 1 4.667v6.666C1 12.253 1.746 13 2.667 13h6.666c.43 0 .821-.162 1.117-.429l-9.02-9.02zm13.111 8.868a.798.798 0 0 0 .46-.726V4.308c0-.63-.693-1.01-1.233-.696L11 5.218v-.551C11 3.747 10.254 3 9.333 3H5.121l9.419 9.418z" />
        <path fillRule="evenodd" d="M13.646 14.354l-12-12 .708-.708 12 12-.708.707z" />
      </svg>
    );
  }
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      className="bi bi-camera-video-fill"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.667 3h6.666C10.253 3 11 3.746 11 4.667v6.666c0 .92-.746 1.667-1.667 1.667H2.667C1.747 13 1 12.254 1 11.333V4.667C1 3.747 1.746 3 2.667 3z" />
      <path d="M7.404 8.697l6.363 3.692c.54.313 1.233-.066 1.233-.697V4.308c0-.63-.693-1.01-1.233-.696L7.404 7.304a.802.802 0 0 0 0 1.393z" />
    </svg>
  );
};

export default IconCamera;
