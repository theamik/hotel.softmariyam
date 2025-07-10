import React from "react";
import CardDataStats from "../../components/CardDataStats";
import TableOne from "../../components/Tables/TableOne";
import ChatCard from "../../components/Chat/ChatCard";

const HotelDashboard: React.FC = () => {
  return (
    <>
      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Bookings Today"
          total="42"
          rate="+8.2%"
          levelUp
        />
        <CardDataStats
          title="Occupancy Rate"
          total="76%"
          rate="+5.1%"
          levelUp
        />
        <CardDataStats
          title="Total Revenue"
          total="$12,540"
          rate="+12.4%"
          levelUp
        />
        <CardDataStats
          title="Available Rooms"
          total="18"
          rate="-3.2%"
          levelDown
        />
      </div>

      {/* Revenue + Room Status */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3 2xl:gap-7.5">
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
          <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
          <p className="text-gray-500">(Static Chart Placeholder)</p>
          <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
          <h3 className="text-xl font-semibold mb-4">Room Status</h3>
          <ul className="space-y-2">
            <li>🟢 Available: 18</li>
            <li>🔴 Occupied: 30</li>
            <li>🟠 Reserved: 10</li>
            <li>🟡 Maintenance: 2</li>
          </ul>
        </div>
      </div>

      {/* Guests & Payments */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4 2xl:gap-7.5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
          <h3 className="text-xl font-semibold mb-4">Today's Check-ins</h3>
          <ul className="space-y-2">
            <li>Room 101 - John Doe (2:00 PM)</li>
            <li>Room 205 - Jane Smith (3:30 PM)</li>
            <li>Room 307 - Kamal Rahman (5:00 PM)</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
          <h3 className="text-xl font-semibold mb-4">Pending Payments</h3>
          <ul className="space-y-2">
            <li>Room 404 - Sarah Khan ($220)</li>
            <li>Room 112 - Imran Hossain ($175)</li>
          </ul>
        </div>
      </div>

      {/* Maintenance + Notifications */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4 2xl:gap-7.5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
          <h3 className="text-xl font-semibold mb-4">Maintenance Requests</h3>
          <ul className="space-y-2">
            <li>Room 301 - AC not working</li>
            <li>Room 215 - Light flickering</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
          <h3 className="text-xl font-semibold mb-4">Alerts & Notifications</h3>
          <ul className="space-y-2">
            <li>Late checkout: Room 508</li>
            <li>New booking: Room 120 for 2 nights</li>
          </ul>
        </div>
      </div>

      {/* Table and Chat */}
      <div className="mt-6 grid grid-cols-12 gap-4 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <ChatCard />
        </div>
      </div>
    </>
  );
};

export default HotelDashboard;
