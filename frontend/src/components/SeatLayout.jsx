import { useState, useEffect } from 'react';
import { FaChair } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';

const SeatLayout = ({ totalSeats, bookedSeats = [], selectedSeats = [], onSeatSelect, seatLayout = '2x2' }) => {
    const [seats, setSeats] = useState([]);

    useEffect(() => {
        generateSeats();
    }, [totalSeats, seatLayout]);

    const generateSeats = () => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = seatLayout === '4x4' ? 8 : (seatLayout === '2x3' || seatLayout === '3x2') ? 5 : 4;
        const allSeats = [];

        let seatCount = 0;
        for (let row of rows) {
            const rowSeats = [];
            for (let i = 1; i <= seatsPerRow; i++) {
                if (seatCount >= totalSeats) break;
                rowSeats.push(`${row}${i}`);
                seatCount++;
            }
            if (rowSeats.length > 0) {
                allSeats.push(rowSeats);
            }
            if (seatCount >= totalSeats) break;
        }

        setSeats(allSeats);
    };

    const getSeatStatus = (seatNumber) => {
        if (bookedSeats.includes(seatNumber)) return 'booked';
        if (selectedSeats.includes(seatNumber)) return 'selected';
        return 'available';
    };

    const getSeatClasses = (status) => {
        const baseClasses = "w-12 h-12 m-1 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border-2 shadow-sm text-xs font-bold relative";

        switch (status) {
            case 'booked':
                return `${baseClasses} bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-60`;
            case 'selected':
                return `${baseClasses} bg-green-500 border-green-600 text-white transform scale-105 shadow-md`;
            default: // available
                return `${baseClasses} bg-white border-blue-200 text-blue-600 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md cursor-pointer`;
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center mb-8 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-white border-2 border-blue-200 text-blue-600 flex items-center justify-center mr-2">
                        <FaChair size={12} />
                    </div>
                    <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-green-500 border-2 border-green-600 text-white flex items-center justify-center mr-2">
                        <FaChair size={12} />
                    </div>
                    <span className="text-sm text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-gray-300 border-2 border-gray-400 text-gray-500 flex items-center justify-center mr-2">
                        <FaChair size={12} />
                    </div>
                    <span className="text-sm text-gray-600">Booked</span>
                </div>
            </div>

            {/* Bus Cabin */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 relative max-w-sm mx-auto">
                {/* Driver */}
                <div className="absolute top-6 right-6 text-gray-400">
                    <GiSteeringWheel size={32} className="transform rotate-0" />
                </div>
                <div className="mb-12 text-center text-gray-400 text-xs uppercase tracking-widest font-semibold border-b pb-2 mx-10">
                    Front
                </div>

                <div className="flex flex-col items-center space-y-2">
                    {seats.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center">
                            {row.map((seatNumber, seatIndex) => {
                                const status = getSeatStatus(seatNumber);
                                const isAisle = (seatLayout === '2x2' && seatIndex === 1) ||
                                    (seatLayout === '4x4' && seatIndex === 3) ||
                                    (seatLayout === '2x1' && seatIndex === 1) ||
                                    (seatLayout === '2x3' && seatIndex === 1) ||
                                    (seatLayout === '3x2' && seatIndex === 2);

                                return (
                                    <div key={seatNumber} className={isAisle ? 'mr-10 sm:mr-16' : 'mr-1'}>
                                        <button
                                            className={getSeatClasses(status)}
                                            onClick={() => status !== 'booked' && onSeatSelect(seatNumber)}
                                            disabled={status === 'booked'}
                                        >
                                            <FaChair className={status === 'selected' ? 'text-white text-base mb-1' : 'text-current text-base mb-1'} />
                                            <span className="leading-none">{seatNumber}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-gray-300 text-xs uppercase tracking-widest font-semibold pt-2 border-t mx-10">
                    Rear
                </div>
            </div>
        </div>
    );
};

export default SeatLayout;
