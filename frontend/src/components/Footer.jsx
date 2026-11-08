import { FaBus, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="mb-6 md:mb-0">
                        <h5 className="text-xl font-bold mb-4 flex items-center text-white">
                            <FaBus className="mr-2 text-blue-500" />
                            महाराजा BusBooking
                        </h5>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Your trusted partner for comfortable and affordable bus travel across the country. Experience safe and reliable journeys with us.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="mb-6 md:mb-0">
                        <h6 className="text-lg font-semibold mb-4 text-gray-200">Quick Links</h6>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="text-gray-400 hover:text-blue-400 transition duration-200 block">Home</a></li>
                            <li><a href="/my-bookings" className="text-gray-400 hover:text-blue-400 transition duration-200 block">My Bookings</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition duration-200 block">Terms & Conditions</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition duration-200 block">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h6 className="text-lg font-semibold mb-4 text-gray-200">Contact Us</h6>
                        <div className="flex items-center text-gray-400 mb-3 group transition duration-200">
                            <FaEnvelope className="mr-3 text-gray-500 group-hover:text-blue-500" />
                            <span className="group-hover:text-gray-200">maharaja@busbooking.com</span>
                        </div>
                        <div className="flex items-center text-gray-400 group transition duration-200">
                            <FaPhone className="mr-3 text-gray-500 group-hover:text-green-500" />
                            <span className="group-hover:text-gray-200">+91 98339 55318</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} महाराजा BusBooking. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
