
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import Tabs from "./components/Tabs";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import Orders from "./components/Orders";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrderDeliverPage from "./pages/OrderDeliverPage";
import LoginPage from "./pages/LoginPage";

const App = () => {


  return (
    // <div className="flex min-h-screen bg-gray-50">
    //   <Sidebar active="Quản lý đơn hàng" />
      
    //     <OrderDeliverPage/>
    //   </div>
    <LoginPage/>
  );
};

export default App;
