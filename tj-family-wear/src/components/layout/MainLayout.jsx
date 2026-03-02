import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <>
      {/* Navbar هيتحط هنا */}
      <Navbar />
      <Outlet />
      {/* Footer هيتحط هنا */}
    </>
  );
}
