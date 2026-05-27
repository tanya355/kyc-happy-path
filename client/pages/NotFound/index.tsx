import { useEffect } from "react";
import { useLocation } from "react-router";
import { getNotFoundData } from "./NotFoundData";

export default function NotFound() {
  const location = useLocation();
  const { code, message, linkLabel, homePath } = getNotFoundData();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{code}</h1>
        <p className="text-xl text-gray-600 mb-4">{message}</p>
        <a href={homePath} className="text-blue-500 hover:text-blue-700 underline">
          {linkLabel}
        </a>
      </div>
    </div>
  );
}
