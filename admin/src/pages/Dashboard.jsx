import { useState, useEffect } from 'react';
import { FaBus, FaRoute, FaTicketAlt, FaUsers, FaArrowUp, FaChartBar, FaCalendarCheck, FaPlus } from 'react-icons/fa';
import api from '../utils/api';
import BusFormModal from '../components/BusFormModal';
import RouteFormModal from '../components/RouteFormModal';

const Dashboard = () => {
    const [stats, setStats] = useState({
        buses: 0,
        routes: 0,
        bookings: 0,
        users: 0
    });
    const [allBuses, setAllBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBusModal, setShowBusModal] = useState(false);
    const [showRouteModal, setShowRouteModal] = useState(false);

    const fetchStats = async () => {
        try {
            const [busesRes, routesRes, bookingsRes, usersRes] = await Promise.all([
                api.get('/buses'),
                api.get('/routes'),
                api.get('/bookings'),
                api.get('/users')
            ]);

            setAllBuses(busesRes.data.buses);
            setStats({
                buses: busesRes.data.buses.length,
                routes: routesRes.data.routes.length,
                bookings: bookingsRes.data.bookings.length,
                users: usersRes.data.users.length
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Buses', value: stats.buses, icon: <FaBus />, color: 'blue' },
        { title: 'Active Routes', value: stats.routes, icon: <FaRoute />, color: 'indigo' },
        { title: 'Total Bookings', value: stats.bookings, icon: <FaTicketAlt />, color: 'emerald' },
        { title: 'Registered Users', value: stats.users, icon: <FaUsers />, color: 'amber' }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Intelligence...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h2>
                    <p className="text-gray-500 font-medium text-sm mt-1">Real-time monitoring of your transport ecosystem</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowBusModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 text-sm"
                    >
                        <FaPlus className="mr-2" /> Add Bus
                    </button>
                    <button
                        onClick={() => setShowRouteModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 text-sm"
                    >
                        <FaPlus className="mr-2" /> Add Route
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform ${card.color === 'blue' ? 'text-blue-600' :
                            card.color === 'indigo' ? 'text-indigo-600' :
                                card.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                            <div className="text-7xl">{card.icon}</div>
                        </div>

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${card.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                                card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' :
                                    card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                                        'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
                                }`}>
                                <div className="text-xl">{card.icon}</div>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
                            <h3 className="text-3xl font-black text-gray-900 tabular-nums">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
                                <FaChartBar className="mr-3 text-blue-600" /> Activity Trend
                            </h3>
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-1">Last 30 Days Growth</p>
                        </div>
                        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-black flex items-center">
                            <FaArrowUp className="mr-2" /> +12.5%
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 60, 45, 80, 55, 90, 70, 85, 40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                            <div
                                key={i}
                                className="w-full bg-blue-100 rounded-t-lg relative group transition-all hover:bg-blue-600"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {Math.floor(h * 1.5)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Jan 01</span>
                        <span>Jan 15</span>
                        <span>Jan 30</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg p-8 text-white flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <FaCalendarCheck className="text-9xl transform rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-2 leading-tight">Ready for Launch</h3>
                        <p className="text-blue-100 text-sm font-medium opacity-80">Your systems are synchronized and stable. System load is currently at 4%.</p>
                    </div>

                    <div className="relative z-10 mt-8">
                        <div className="p-4 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest">Fleet Ready</span>
                                <span className="text-[10px] font-black">98%</span>
                            </div>
                            <div className="w-full h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
                                <div className="w-[98%] h-full bg-white"></div>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-50 transition-colors uppercase tracking-widest">
                            View Reports
                        </button>
                    </div>
                </div>
            </div>

            <BusFormModal
                isOpen={showBusModal}
                onClose={() => setShowBusModal(false)}
                onSuccess={fetchStats}
            />

            <RouteFormModal
                isOpen={showRouteModal}
                onClose={() => setShowRouteModal(false)}
                onSuccess={fetchStats}
                buses={allBuses}
            />
        </div>
    );
};

export default Dashboard;
