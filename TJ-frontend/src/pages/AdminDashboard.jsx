import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  DollarSign, ShoppingBag, Clock, Activity,
  ChevronLeft, Image as ImageIcon, Search,
  RefreshCw, TrendingUp, Package, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatImageUrl } from "../utils/helpers";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const STATUS_LABELS = {
  pending: { label: 'قيد الانتظار', color: 'text-yellow-400 bg-yellow-400/10' },
  processing: { label: 'جاري التجهيز', color: 'text-blue-400 bg-blue-400/10' },
  shipped: { label: 'تم الشحن', color: 'text-purple-400 bg-purple-400/10' },
  delivered: { label: 'تم التسليم', color: 'text-emerald-400 bg-emerald-400/10' },
  cancelled: { label: 'ملغي', color: 'text-red-400 bg-red-400/10' },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("access_token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, ordersRes, topProductsRes, salesRes] = await Promise.all([
        api.get("/admin/stats/", config),
        api.get("/admin/orders/", config),
        api.get("/admin/top-products/", config),
        api.get("/admin/sales-chart/", config),
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setTopProducts(topProductsRes.data);
      setSalesData(salesRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Admin error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await api.patch(`/admin/orders/${orderId}/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("فشل تحديث الحالة");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = !searchQuery ||
      order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone?.includes(searchQuery) ||
      order.id?.toString().includes(searchQuery);
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 text-sm">جاري تحميل البيانات...</p>
    </div>
  );

  if (!stats) return (
    <div className="text-white text-center py-20">عذراً، لا تملك صلاحية الدخول.</div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">طلب #{selectedOrder.id}</h3>
                <p className="text-gray-400 text-sm mt-1">{new Date(selectedOrder.created_at).toLocaleString('ar-EG')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* بيانات العميل */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">بيانات العميل</p>
                <p className="font-bold text-lg">{selectedOrder.full_name}</p>
                <p className="text-gray-400">{selectedOrder.phone}</p>
                <p className="text-gray-400 text-sm mt-1">{selectedOrder.address} - {selectedOrder.city}</p>
              </div>

              {/* المنتجات مع الصور ✅ */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">المنتجات</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {/* صورة المنتج */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                        {item.image ? (
                          <img
                            src={formatImageUrl(item.image)}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      {/* التفاصيل */}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-400">مقاس: {item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-brand-gold font-bold text-sm">{(item.price * item.quantity).toLocaleString()} EGP</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* الدفع والإجمالي */}
              <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">طريقة الدفع</p>
                  <p className="font-bold mt-1">{selectedOrder.payment_method}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">الإجمالي</p>
                  <p className="text-2xl font-bold text-brand-gold">{selectedOrder.total_amount?.toLocaleString()} EGP</p>
                </div>
              </div>

              {/* إيصال الدفع */}
              {selectedOrder.payment_screenshot && (
                <a href={formatImageUrl(selectedOrder.payment_screenshot)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-gold hover:underline text-sm">
                  <ImageIcon className="w-4 h-4" /> عرض إيصال الدفع
                </a>
              )}

              {/* تغيير الحالة */}
              <div>
                <p className="text-xs text-gray-400 mb-2">تغيير الحالة</p>
                <select
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-gold"
                  value={selectedOrder.status}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-gray-500 text-sm mt-1">
              {lastUpdated ? `آخر تحديث: ${lastUpdated.toLocaleTimeString('ar-EG')}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchData(true)}
              className="flex items-center gap-2 text-sm border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
              <RefreshCw className="w-4 h-4" /> تحديث
            </button>
            <Link to="/shop"
              className="flex items-center gap-2 text-sm bg-brand-gold text-brand-dark px-4 py-2 rounded-xl font-bold hover:bg-white transition-all">
              <ChevronLeft className="w-4 h-4" /> المتجر
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard title="إجمالي المبيعات" value={`${stats.total_sales?.toLocaleString()} EGP`} icon={<DollarSign className="w-5 h-5" />} color="text-emerald-400" />
          <StatCard title="كل الطلبات" value={stats.total_orders} icon={<ShoppingBag className="w-5 h-5" />} color="text-blue-400" />
          <StatCard
            title="قيد الانتظار"
            value={pendingCount}
            icon={<Clock className="w-5 h-5" />}
            color="text-brand-gold"
            urgent={pendingCount > 0}
          />
          <StatCard title="أعلى مبيعاً" value={topProducts[0]?.product_name?.slice(0, 12) || '—'} icon={<TrendingUp className="w-5 h-5" />} color="text-purple-400" />
        </div>

        {/* Chart */}
        {salesData.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
            <h2 className="text-base font-bold mb-6">مبيعات الأشهر الماضية</h2>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="total_sales" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Orders */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-gold" />
              الطلبات ({filteredOrders.length})
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو التليفون..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:border-brand-gold w-full sm:w-56"
                />
              </div>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-gold"
              >
                <option value="all">كل الحالات</option>
                {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">لا توجد طلبات</p>
            ) : (
              filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* صور المنتجات في قائمة الطلبات ✅ */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-[#0a0a0a] bg-white/5 flex-shrink-0">
                          {item.image ? (
                            <img src={formatImageUrl(item.image)} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold text-gray-400">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{order.full_name || 'عميل'}</p>
                      <p className="text-xs text-gray-400">{order.phone} • #{order.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mr-14 sm:mr-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[order.status]?.color || 'text-gray-400 bg-gray-400/10'}`}>
                      {STATUS_LABELS[order.status]?.label || order.status}
                    </span>
                    <p className="text-brand-gold font-bold text-sm">{order.total_amount?.toLocaleString()} EGP</p>
                    <select
                      className="bg-[#0a0a0a] border border-white/10 rounded-lg text-xs p-2 focus:outline-none focus:border-brand-gold"
                      value={order.status}
                      disabled={updatingOrder === order.id}
                      onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-base font-bold mb-6">الأكثر مبيعاً</h2>
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-brand-gold font-bold text-lg w-6">#{idx + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{product.product_name}</p>
                      <p className="text-xs text-gray-400">{product.total_sold} طلب</p>
                    </div>
                  </div>
                  <p className="text-brand-gold font-bold text-sm">{Number(product.revenue).toLocaleString()} EGP</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, urgent }) => (
  <div className={`bg-white/5 border rounded-2xl p-5 transition-all ${urgent ? 'border-brand-gold/50 bg-brand-gold/5' : 'border-white/10 hover:bg-white/[0.08]'}`}>
    <div className={`${color} mb-3`}>{icon}</div>
    <p className="text-gray-400 text-xs mb-1">{title}</p>
    <p className="text-xl font-bold truncate">{value}</p>
    {urgent && <p className="text-brand-gold text-xs mt-1 animate-pulse">● يحتاج مراجعة</p>}
  </div>
);

export default AdminDashboard;
