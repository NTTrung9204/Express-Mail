
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import Tabs from "./components/Tabs";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import Orders from "./components/Orders";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrderDeliverPage from "./pages/OrderDeliverPage";
import LoginPage from "./pages/LoginPage";


import { Route, Routes } from 'react-router-dom'
import { ToastContainer} from 'react-toastify';
import MainLayout from "./pages/MainLayout";


const App = () => {


  return (
    <div>
      <ToastContainer/>
    <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/create-order" element={
          <MainLayout>
            <CreateOrderPage />
          </MainLayout>
        }/>
        <Route path="/order-delivery" element={
          <MainLayout>
            <OrderDeliverPage />
          </MainLayout>
        }/>
      </Routes>
    </div>
  );
};

export default App;
