import { FaBus, FaClock, FaRupeeSign, FaChair, FaSnowflake } from 'react-icons/fa';

const API_BASE = 'http://localhost:5000';

const BusCard = ({ route, onSelect }) => {
    const formatTime = (time) => {
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const bus = route.busId;

    return (
        <div
            onClick={onSelect}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden mb-6 cursor-pointer transform hover:-translate-y-1 ring-1 ring-black ring-opacity-5"
        >
            {/* Bus Image Banner */}
            {bus?.image && (
                <div className="relative h-36 overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100">
                    <img
                        src={`${API_BASE}${bus.image}`}
                        alt={bus.busName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    {bus.busType === 'AC' && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                            <FaSnowflake className="text-[8px]" /> AC
                        </span>
                    )}
                </div>
            )}

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                    {/* Bus Info */}
                    <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                        {!bus?.image && (
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
                                <FaBus className="text-xl" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {bus?.busName || 'Premium Bus'}
                            </h3>
                            <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                    {bus?.seatLayout || '2x2'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    • {bus?.busNumber}
                                </span>
                                {bus?.busType && !bus?.image && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bus.busType === 'AC' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {bus.busType}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="text-left sm:text-right">
                        <div className="flex items-center sm:justify-end text-xl font-extrabold text-gray-900">
                            <FaRupeeSign className="text-base mr-1" />
                            {route.price}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">per seat</p>
                    </div>
                </div>

                {/* Journey Timeline */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 flex items-center justify-between relative">
                    <div className="text-center min-w-[80px]">
                        <p className="text-lg font-bold text-gray-900">{formatTime(route.departureTime)}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide truncate max-w-[100px]">{route.source}</p>
                    </div>

                    <div className="flex-1 px-2 sm:px-8 flex flex-col items-center">
                        <div className="w-full relative flex items-center">
                            <div className="w-full h-0.5 bg-gray-300"></div>
                            <div className="absolute left-0 w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="absolute right-0 w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 text-gray-400">
                                <FaBus className="text-xs" />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">Journey</p>
                    </div>

                    <div className="text-center min-w-[80px]">
                        <p className="text-lg font-bold text-gray-900">{formatTime(route.arrivalTime)}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide truncate max-w-[100px]">{route.destination}</p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-5 flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                    <div className="flex items-center text-gray-500 font-medium">
                        <FaChair className="mr-2 text-blue-500" />
                        <span>{bus?.totalSeats} Seats Available</span>
                    </div>
                </div>
            </div>

            {/* Hover Action Bar */}
            <div className="h-1 w-full bg-gray-100 group-hover:bg-blue-600 transition-colors duration-300"></div>
        </div>
    );
};

export default BusCard;

