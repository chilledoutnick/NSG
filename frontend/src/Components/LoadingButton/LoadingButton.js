// components/LoadingButton.js
import React from "react";
import { ThreeDots } from "react-loader-spinner";

export default function LoadingButton({ loading, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`px-4 py-2 rounded-md bg-blue-600 text-white flex justify-center items-center ${
        loading ? "opacity-75 cursor-not-allowed" : ""
      }`}
    >
      {!loading ? (
        children
      ) : (
        <ThreeDots
          height="25"
          width="60"
          radius="9"
          color="white"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      )}
    </button>
  );
}
