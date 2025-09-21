
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import Tabs from "./components/Tabs";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import Orders from "./components/Orders";
import CreateOrderPage from "./pages/CreateOrderPage";

const App = () => {


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Quản lý đơn hàng" />
      
        <CreateOrderPage/>
      </div>
  );
};

export default App;
