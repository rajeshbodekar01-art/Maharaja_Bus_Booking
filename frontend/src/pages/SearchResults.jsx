import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilter, FaSearch } from 'react-icons/fa';
import api from '../utils/api';
import BusCard from '../components/BusCard';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');

    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/routes/search?source=${source}&destination=${destination}&date=${date}`);
                setRoutes(response.data.routes);
            } catch (err) {
                setError('Failed to fetch bus routes. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (source && destination && date) {
            fetchRoutes();
        }
    }, [source, destination, date]);

    const handleSelectBus = (routeId) => {
        navigate(`/seat-selection/${routeId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Searching for available buses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Search Context */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between border border-gray-100">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium mb-4 md:mb-0"
                    >
                        <FaArrowLeft className="mr-2" /> Back
                    </button>

                    <div className="text-center">
                        <div className="flex items-center justify-center text-xl md:text-2xl font-bold text-gray-900">
                            <span>{source}</span>
                            <span className="text-gray-400 mx-3">→</span>
                            <span>{destination}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="hidden md:block w-20"></div> {/* Spacer for center alignment */}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded shadow-sm" role="alert">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center text-lg">
                                <FaFilter className="mr-3 text-blue-600" /> Filters
                            </h3>
                            <div className="border-t border-gray-100 pt-8 text-center bg-gray-50 rounded-lg py-8">
                                <p className="text-gray-400 text-sm font-medium">No filters available yet.</p>
                            </div>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="w-full lg:w-3/4">
                        {routes.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 text-blue-500 mb-6">
                                    <FaSearch className="text-4xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Buses Found</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't find any buses for this route on the selected date. Try changing the date or route.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Search Another Route
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-gray-600 font-medium">{routes.length} Buses Found</p>
                                    <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">Best Prices</span>
                                </div>
                                {routes.map(route => (
                                    <BusCard
                                        key={route._id}
                                        route={route}
                                        onSelect={() => handleSelectBus(route._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
