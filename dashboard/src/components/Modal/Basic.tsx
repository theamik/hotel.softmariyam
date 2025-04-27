import classNames from "classnames";
import React from "react";

const Frame: React.FC<{ open?: boolean; onClose: () => void }> = ({
  children,
  open = true,
  onClose,
}) => {
  return (
    // overlay: 90% opacity of the bg, `inset-0` to stretch over the entire screen
    <div
      className={classNames(
        "fixed inset-0 z-10 p-8 mt-10 text-white bg-gray-600/90",
        `${open ? "block" : "hidden"}` // control visibility via `open` attribute (or render conditionally)
      )}
    >
      {/* container: `max-w-sm` to make it reasonably narrow, `mx-auto` to center horizontally */}
      <div className="relative w-full max-w-sm mx-auto mt-8">
        {/* closer in the corner */}
        <button
          className="absolute -top-2 -right-2 flex justify-center rounded-full h-8 w-8 bg-gray-600 cursor-pointer shadow-xl"
          onClick={() => onClose()}
          title="Bye bye"
        >
          <span className="text-2xl leading-7 select-none">&times;</span>
        </button>
        {/* contents */}
        <div className="overflow-hidden bg-gray-800 rounded shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
};

const Head: React.FC = ({ children }) => (
  <div className="block p-4 bg-gray-900">
    <h1 className="text-lg">{children}</h1>
  </div>
);

const Body: React.FC = ({ children }) => <div className="p-4">{children}</div>;

export const Modal = { Frame, Head, Body };
