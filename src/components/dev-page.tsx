import * as React from "react";
import { Link } from "react-router-dom";

export function DevPage() {
  const entries = [
    "XrhqJmQnKAs",
    "MoH8Fk2K9bc",
    "vCb8iA4SjOI",
    "GZ2uc-3pQbA",
    "FSYe9GQc9Ow",
    "EnPYXckiUVg",
  ];

  return (
    <div className="sm:p-4 h-full flex justify-center">
      <div
        className="
          w-full sm:max-w-lg
          h-full
          flex flex-col
          sm:border border-solid border-gray-200
        "
      >
        <div className="flex-[1_0_0] overflow-y-auto bg-white">
          <div className="flex flex-col p-2 gap-2">
            {entries.map((videoId) => (
              <div key={videoId}>
                <Link to={`/setup/${videoId}`}>{videoId}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
