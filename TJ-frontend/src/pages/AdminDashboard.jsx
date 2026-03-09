import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Activity,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";

import { Link } from "react-router-dom";
import { formatImageUrl } from "../utils/helpers";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [statsRes, ordersRes, topProductsRes, salesRes] =
        await Promise.all([
          api.get("/admin/stats/", config),
          api.get("/admin/orders/", config),
          api.get("/admin/top-products/", config),
          api.get("/admin/sales-chart/", config),
        ]);

      const sortedOrders = ordersRes.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setStats(statsRes.data);
      setOrders(sortedOrders);
      setTopProducts(topProductsRes.data);
      setSalesData(salesRes.data);
    } catch (err) {
      console.error("Admin error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);

      await api.patch(`/admin/orders/${orderId}/`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert("فشل تحديث الحالة");
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading Dashboard...</p>
      </div>
    );

  if (!stats)
    return (
      <div className="text-white text-center py-20">
        عذراً، لا تملك صلاحية الدخول.
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-dark py-20 px-6 lg:px-12 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-bold font-display italic tracking-tight uppercase">
              Dashboard <span className="text-brand-gold">.Control</span>
            </h1>

            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              نظام إدارة المتجر المركزي
            </p>
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-2 text-[10px] font-black uppercase border border-white/10 px-6 py-3 rounded-full hover:bg-white hover:text-brand-dark transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة للمتجر
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard
            title="إجمالي المبيعات"
            value={`${stats.total_sales?.toLocaleString()} EGP`}
            icon={<DollarSign className="w-6 h-6" />}
            trend="+12%"
            color="text-emerald-400"
          />

          <StatCard
            title="عدد الطلبات"
            value={stats.total_orders}
            icon={<ShoppingBag className="w-6 h-6" />}
            trend="New"
            color="text-blue-400"
          />

          <StatCard
            title="طلبات قيد الانتظار"
            value={stats.pending_orders}
            icon={<Clock className="w-6 h-6" />}
            trend="Urgent"
            color="text-brand-gold"
          />
        </div>

        {/* Sales Chart */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 mb-16">
          <h2 className="text-xl font-bold mb-8 italic">Sales Overview</h2>

          {/* التعديل هنا: استخدام h-[300px] مباشر للـ Container لحل مشكلة التحذير */}
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={salesData}>
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
                <Line
                  type="monotone"
                  dataKey="total_sales"
                  stroke="#d4af37"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-10">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 italic">
            <Activity className="text-brand-gold w-5 h-5" />
            إدارة الطلبات الأخيرة ({orders.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="text-[10px] font-black uppercase text-gray-500 border-b border-white/10">
                <tr>
                  <th className="pb-4">رقم الطلب</th>
                  <th className="pb-4">العميل</th>
                  <th className="pb-4">الدفع</th>
                  <th className="pb-4">المجموع</th>
                  <th className="pb-4">الحالة</th>
                  <th className="pb-4">تغيير الحالة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr
                    key={`order-${order.id}`}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-5 font-mono text-xs">
                      #{order.id.toString().padStart(4, "0")}
                    </td>

                    <td className="py-5">
                      <p className="text-sm font-bold uppercase">
                        {order.full_name || "عميل مجهول"}
                      </p>
                      <p className="text-[9px] text-gray-500">{order.phone}</p>
                    </td>

                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase">
                          {order.payment_method}
                        </span>

                        {order.payment_screenshot && (
                          <a
                            href={formatImageUrl(order.payment_screenshot)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-gold hover:text-white transition-colors"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-5 text-sm text-brand-gold font-bold">
                      {order.total_amount?.toLocaleString()} EGP
                    </td>

                    <td className="py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase
                        ${
                          order.status === "delivered"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : order.status === "cancelled"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-brand-gold/10 text-brand-gold"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-5">
                      <select
                        disabled={updatingOrder === order.id}
                        className="bg-brand-dark border border-white/10 rounded-lg text-[10px] p-2 focus:outline-none focus:border-brand-gold cursor-pointer"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 mt-10">
          <h2 className="text-xl font-bold mb-8 italic">
            Top Selling Products
          </h2>

          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={`top-prod-${product.id || product.product_name}`}
                className="flex items-center justify-between border-b border-white/10 pb-4"
              >
                <div className="flex items-center gap-4">
                   <img
                    src={product.image ? formatImageUrl(product.image) : "https://placehold.co/100x100?text=No+Image"}
                    className="w-12 h-12 rounded-lg object-cover bg-white/5"
                    alt={product.product_name}
                    onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Error"; }}
                  />
                  <div>
                    <p className="font-bold">{product.product_name || product.name}</p>
                    <p className="text-xs text-gray-400">
                      {product.total_sold || product.sales} orders
                    </p>
                  </div>
                </div>

                <p className="text-brand-gold font-bold">
                  {product.revenue || product.price} EGP
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.08] transition-all group">
    <div className="flex justify-between items-start mb-8">
      <div
        className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>

      <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full uppercase tracking-tighter">
        {trend}
      </span>
    </div>

    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
      {title}
    </h3>

    <p className="text-3xl font-bold font-display italic tracking-tight text-white">
      {value}
    </p>
  </div>
);

export default AdminDashboard;