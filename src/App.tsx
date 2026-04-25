/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Flame,
  BriefcaseMedical,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  BookOpen,
  User,
  ExternalLink,
  Maximize,
  Minimize,
  Plus,
  Trash2,
  LogIn,
  Instagram,
  Coffee,
  Train,
  Layout,
  CheckCircle,
  AlertCircle,
  X,
  Cog,
  Calendar,
  Megaphone,
  ListCheckIcon,
  CogIcon,
  CalendarDaysIcon,
  MapPinCheckInside,
  ShieldQuestionIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

// --- Types ---

interface RoomAllocation {
  id: number;
  roomName: string;
  status: 'available' | 'live' | 'break';
  course?: string;
  topic?: string;
  trainer?: string;
  intake?: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  icon?: string;
}

interface StaffMember {
  id: string;
  name: string;
  intake: string;
  room: string;
  course: string;
  topics?: string;
}

interface Announcement {
  id: number;
  text: string;
  color: string;
  expiresAt: string;
}

interface WeatherDay {
  day: string;
  temp: { high: number; low: number };
  condition: 'sunny' | 'rainy' | 'cloudy' | 'partly-cloudy';
}

// --- Mock Data ---

const INITIAL_ROOMS: RoomAllocation[] = [
  { id: 1, roomName: 'Room 1', status: 'available' },
  { id: 2, roomName: 'Room 2', status: 'available' },
  { id: 3, roomName: 'Room 3', status: 'available' },
  { id: 4, roomName: 'Room 4', status: 'available' },
  { id: 5, roomName: 'Room 5', status: 'available' },
  { id: 6, roomName: 'Room 6', status: 'available' },
];

const EVENTS: Event[] = [
  {
    id: 1,
    title: 'Term 2 Starts',
    date: 'Monday 20 April 2026',
    description: 'Welcome back — new term, new opportunities ahead.'
  },
  {
    id: 2,
    title: 'Campus Tour',
    date: 'Wednesday 1 April 2026',
    description: 'Join us for a guided tour of our state-of-the-art facilities.'
  },
  {
    id: 3,
    title: 'Student Workshop',
    date: 'Friday 10 April 2026',
    description: 'A deep dive into professional development and networking.'
  }
];

const WEATHER_FORECAST: WeatherDay[] = [
  { day: 'TODAY', temp: { high: 27, low: 19 }, condition: 'partly-cloudy' },
  { day: 'THU', temp: { high: 27, low: 20 }, condition: 'rainy' },
  { day: 'FRI', temp: { high: 25, low: 20 }, condition: 'sunny' },
  { day: 'SAT', temp: { high: 23, low: 20 }, condition: 'partly-cloudy' },
  { day: 'SUN', temp: { high: 23, low: 22 }, condition: 'partly-cloudy' },
];

// --- Components ---

const Header = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <img
            src="/images/eqc-logo.png"
            alt="EQC Institute"
            className="h-20 w-auto object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://equinimcollege.com/wp-content/uploads/2021/08/EQC-Logo-1.png";
              (e.target as HTMLImageElement).onerror = () => {
                (e.target as HTMLImageElement).src = "https://placehold.co/400x120/1a7a54/ffffff?text=EQC+INSTITUTE";
              };
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold serif text-eqc-text tracking-tight leading-none">Welcome to Equinim College</h1>
          <p className="text-3xl text-eqc-muted font-medium mt-1">Perth Campus</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-right">
        <div className="flex items-center gap-6 bg-gray-50 px-8 h-20 rounded-2xl border border-gray-100">
          <span className="text-2xl font-bold text-eqc-muted tracking-tight">{formattedDate}</span>
          <div className="w-px h-12 bg-gray-300 mx-2" />
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold serif text-eqc-text tracking-tighter leading-none">{formattedTime.split(' ')[0]}</span>
            <span className="text-2xl font-bold serif text-eqc-text uppercase leading-none">{formattedTime.split(' ')[1]}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

interface RoomItemProps {
  room: RoomAllocation;
  key?: any;
}

const RoomItem = ({ room }: RoomItemProps) => {
  const isLive = room.status === 'live';
  const isBreak = room.status === 'break';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center justify-between p-5 rounded-2xl transition-all cursor-default flex-1
        ${isLive ? 'bg-eqc-green text-white shadow-xl scale-[1.01]' : isBreak ? 'bg-orange-500 text-white shadow-lg' : 'bg-white border border-gray-100 shadow-sm'}
      `}
    >
      <div className="flex items-center gap-10 flex-1">
        <div className="w-32 shrink-0">
          <h3 className="text-2xl font-bold serif leading-none mb-1">{room.roomName}</h3>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : isBreak ? 'bg-white' : 'bg-eqc-green'}`}></div>
            <span className={`text-xs font-bold uppercase tracking-wider ${isLive || isBreak ? 'text-white/80' : 'text-eqc-muted'}`}>
              {room.status}
            </span>
          </div>
        </div>

        {isLive && (
          <div className="flex gap-12 flex-1">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-0.5">Course</span>
              <span className="font-bold text-lg leading-tight">{room.course}</span>
              <div className="flex items-center gap-1.5 text-sm opacity-90 italic mt-1 font-medium">
                <BookOpen size={14} />
                <span>{room.topic}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-0.5">Trainer</span>
              <span className="font-bold text-lg">{room.trainer}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-0.5">Intake</span>
              <span className="font-bold text-lg">{room.intake}</span>
            </div>
          </div>
        )}

        {isBreak && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-xl font-bold italic">
              <Coffee size={24} />
              <span>Scheduled Break</span>
            </div>
          </div>
        )}

        {!isLive && !isBreak && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-base text-eqc-muted font-medium italic">Available for study</span>
          </div>
        )}
      </div>

      <div className="shrink-0 ml-4">
        {isLive && (
          <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm">
            <div className="w-2 h-1 bg-white rounded-full animate-ping"></div>
            <span className="text-[10px] font-black tracking-widest uppercase">In Session</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EventList = ({ events }: { events: Event[] }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-10 h-10 bg-eqc-green/10 flex items-center justify-center rounded-full">
          <CalendarDaysIcon size={30} className="text-eqc-green" />
        </div>
        <h2 className="text-2xl text-eqc-green font-bold serif">Upcoming Events:</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {events.length === 0 ? (
          <p className="text-eqc-muted italic text-base">No events scheduled.</p>
        ) : (
          events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l-4 border-eqc-green pl-4 py-0.5"
            >
              <div className="flex flex-col gap-0.5 mb-1">
                <h3 className="text-xl font-bold serif text-eqc-text leading-tight">{event.title}</h3>
                <p className="text-xs font-bold text-eqc-green uppercase tracking-wider">
                  {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <p className="text-sm text-eqc-muted leading-relaxed line-clamp-2">{event.description}</p>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-eqc-muted shrink-0">
        Questions? Contact <span className="text-eqc-green font-bold">trainer@equinimcollege.com</span>
      </div>
    </div>
  );
};

const WeatherIcon = ({ condition, size = 24 }: { condition: WeatherDay['condition'], size?: number }) => {
  switch (condition) {
    case 'sunny': return <Sun size={size} className="text-yellow-500" />;
    case 'rainy': return <CloudRain size={size} className="text-blue-400" />;
    case 'cloudy': return <Cloud size={size} className="text-gray-400" />;
    case 'partly-cloudy': return <div className="relative"><Sun size={size} className="text-yellow-500" /><Cloud size={size * 0.7} className="text-gray-300 absolute -bottom-1 -right-1" /></div>;
    default: return <Sun size={size} className="text-yellow-500" />;
  }
};

const WeatherWidget = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Sun size={24} className="text-eqc-green" />
          <h2 className="text-2xl font-bold serif">Perth Weather</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Live</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-5">
          <WeatherIcon condition="partly-cloudy" size={64} />
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className="text-6xl font-bold serif leading-none">22</span>
              <span className="text-2xl font-bold serif ml-1 leading-none">°C</span>
            </div>
            <p className="text-sm font-medium text-eqc-muted mt-1">Mainly clear</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-eqc-muted font-bold mb-2">Feels 19°C</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 justify-end text-xs text-eqc-muted">
              <Droplets size={14} className="text-blue-400" />
              <span className="font-bold">63%</span>
            </div>
            <div className="flex items-center gap-2 justify-end text-xs text-eqc-muted">
              <Wind size={14} className="text-gray-400" />
              <span className="font-bold">25 km/h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-auto shrink-0">
        {WEATHER_FORECAST.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black text-eqc-muted mb-2 uppercase tracking-tight">{day.day}</span>
            <WeatherIcon condition={day.condition} size={24} />
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <span className="text-sm font-bold">{day.temp.high}°</span>
              <span className="text-xs text-eqc-muted font-medium">{day.temp.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminHub = ({
  rooms,
  events,
  staff,
  announcements,
  onClose
}: {
  rooms: RoomAllocation[],
  events: Event[],
  staff: StaffMember[],
  announcements: Announcement[],
  onClose: () => void
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'events' | 'announcements'>('rooms');

  // Staff Sign-on State
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [customRoom, setCustomRoom] = useState("");
  const [customCourse, setCustomCourse] = useState("");

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setIsLoggedIn(true);
        setLoginError("");
      } else {
        setLoginError("Invalid password. Please try again.");
      }
    } catch (err) {
      setLoginError("Could not reach the server. Try again in a moment.");
    }
  };

  const updateRooms = async (newRooms: RoomAllocation[]) => {
    await fetch("/api/update-rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_all", data: newRooms })
    });
  };

  const updateEvents = async (newEvent: Partial<Event>, action: 'update_single' | 'delete') => {
    await fetch("/api/update-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data: newEvent })
    });
  };

  const updateAnnouncements = async (data: any, action: 'add' | 'delete') => {
    await fetch("/api/update-announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data })
    });
  };

  const handleStaffSignOn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const intake = formData.get('intake') as string;
    const topics = formData.get('topics') as string;

    const room = selectedRoom === 'other' ? customRoom : selectedRoom;
    const course = selectedCourse === 'other' ? customCourse : selectedCourse;

    if (!room || !course) {
      setStatusMessage({ text: "Please select a room and course.", type: 'error' });
      return;
    }

    try {
      await fetch("/api/staff-signon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, intake, room, course, topics })
      });

      // Also update the room allocation if it's one of the main rooms
      const roomNum = parseInt(room.replace('Room ', ''));
      if (!isNaN(roomNum) && roomNum >= 1 && roomNum <= 6) {
        const newRooms = [...rooms];
        const roomIdx = newRooms.findIndex(r => r.id === roomNum);
        if (roomIdx !== -1) {
          newRooms[roomIdx] = {
            ...newRooms[roomIdx],
            status: 'live',
            course: course,
            trainer: name,
            intake: intake,
            topic: topics || "Class in session"
          };
          updateRooms(newRooms);
        }
      } else if (selectedRoom === 'other') {
        // Add a temporary room for the day
        const newRoom: RoomAllocation = {
          id: Date.now(),
          roomName: customRoom,
          status: 'live',
          course: course,
          trainer: name,
          intake: intake,
          topic: topics || "Class in session"
        };
        updateRooms([...rooms, newRoom]);
      }

      e.currentTarget.reset();
      setSelectedRoom("");
      setSelectedCourse("");
      setCustomRoom("");
      setCustomCourse("");
      setStatusMessage({ text: "Successfully signed on!", type: 'success' });
    } catch (err) {
      setStatusMessage({ text: "Failed to sign on.", type: 'error' });
    }
  };

  const handleStaffSignOff = async (id: string) => {
    try {
      const staffMember = staff.find(s => s.id === id);
      await fetch("/api/staff-signoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      // Reset the room if it was a main room
      if (staffMember) {
        const roomNum = parseInt(staffMember.room.replace('Room ', ''));
        if (!isNaN(roomNum) && roomNum >= 1 && roomNum <= 6) {
          const newRooms = [...rooms];
          const roomIdx = newRooms.findIndex(r => r.id === roomNum);
          if (roomIdx !== -1) {
            newRooms[roomIdx] = {
              ...newRooms[roomIdx],
              status: 'available',
              course: undefined,
              trainer: undefined,
              intake: undefined,
              topic: undefined
            };
            updateRooms(newRooms);
          }
        } else {
          // If it was a custom room, we might want to remove it or just mark available
          // For now, let's just remove it if it's not 1-6
          updateRooms(rooms.filter(r => r.roomName !== staffMember.room));
        }
      }

      setStatusMessage({ text: "Successfully signed off.", type: 'success' });
    } catch (err) {
      setStatusMessage({ text: "Failed to sign off.", type: 'error' });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <ShieldQuestionIcon size={30} className="text-eqc-green" />
              <h2 className="text-2xl font-bold serif text-gray-800">ADMIN LOGIN</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left mb-8">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 animate-shake">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eqc-green outline-none transition-shadow"
                placeholder="Enter staff password"
              />
            </div>
            <button type="submit" className="w-full bg-eqc-green text-white py-3 rounded-xl font-bold hover:bg-eqc-green/90 transition-colors flex items-center justify-center gap-2">
              <LogIn size={20} /> Login
            </button>
          </form>

          {/* Trainer Sign-On Notice */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-eqc-green"></div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">Trainer looking to sign on?</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              If you are a trainer checking in for your class, please use the Trainer Sign-On Portal instead of logging in here.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm shrink-0">
                <QRCodeSVG value={`${window.location.origin}/trainer-sign-on.html`} size={64} />
              </div>
              <div className="text-left flex flex-col items-start">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Scan or Click</span>
                <a 
                  href="/trainer-sign-on.html" 
                  target="_blank" 
                  className="bg-white border border-gray-200 text-eqc-green text-xs font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                >
                  Open Portal <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center shrink-0 relative">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-6 py-2 rounded-full shadow-lg z-50 text-sm font-bold flex items-center gap-2 ${statusMessage.type === 'success' ? 'bg-eqc-green text-white' : 'bg-red-500 text-white'
                }`}
            >
              {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {statusMessage.text}
            </motion.div>
          )}
          <div className="flex items-center gap-3">
            <Cog size={32} />
            <h2 className="text-2xl font-bold serif">Administration Panel</h2>
            {/* <!-- Add gap of 20px between h2 and div --> */}
            <div className="ml-20"></div>
            <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'rooms' ? 'bg-white shadow-sm text-eqc-green' : 'text-gray-500'}`}
              ><ListCheckIcon size={20} className="inline-block mr-1 -mt-1" />
                Rooms
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-white shadow-sm text-eqc-green' : 'text-gray-500'}`}
              ><Calendar size={20} className="inline-block mr-1 -mt-1" />
                Events
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'announcements' ? 'bg-white shadow-sm text-eqc-green' : 'text-gray-500'}`}
              ><AlertCircle size={20} className="inline-block mr-1 -mt-1" />
                Alerts
              </button>
            </div>
          </div>
          <button onClick={onClose} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center gap-2">
            <X size={18} /> Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><Layout size={24} className="text-eqc-green" /> Manage Room Allocations</h3>
                <button
                  onClick={() => updateRooms([...rooms, { id: Date.now(), roomName: "New Room", status: "available" }])}
                  className="bg-eqc-green text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <Plus size={18} /> Add Custom Room
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {rooms.map((room, idx) => {
                  const isCoreRoom = parseInt(room.roomName.replace('Room ', '')) >= 1 && parseInt(room.roomName.replace('Room ', '')) <= 6;
                  return (
                    <div key={room.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold uppercase mb-1">Room Name</label>
                        <input
                          value={room.roomName}
                          readOnly={isCoreRoom}
                          onChange={(e) => {
                            const newRooms = [...rooms];
                            newRooms[idx].roomName = e.target.value;
                            updateRooms(newRooms);
                          }}
                          className={`w-full p-2 border rounded text-sm ${isCoreRoom ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold uppercase mb-1">Status</label>
                        <select
                          value={room.status}
                          onChange={(e) => {
                            const newRooms = [...rooms];
                            newRooms[idx].status = e.target.value as any;
                            updateRooms(newRooms);
                          }}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option value="available">Available</option>
                          <option value="live">Live</option>
                          <option value="break">Break</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold uppercase mb-1">Course</label>
                        <input
                          value={room.course || ""}
                          onChange={(e) => {
                            const newRooms = [...rooms];
                            newRooms[idx].course = e.target.value;
                            updateRooms(newRooms);
                          }}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold uppercase mb-1">Trainer</label>
                        <input
                          value={room.trainer || ""}
                          onChange={(e) => {
                            const newRooms = [...rooms];
                            newRooms[idx].trainer = e.target.value;
                            updateRooms(newRooms);
                          }}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold uppercase mb-1">Topic</label>
                        <input
                          value={room.topic || ""}
                          onChange={(e) => {
                            const newRooms = [...rooms];
                            newRooms[idx].topic = e.target.value;
                            updateRooms(newRooms);
                          }}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => {
                            if (isCoreRoom) {
                              // Just clear the data
                              const newRooms = [...rooms];
                              newRooms[idx] = {
                                ...newRooms[idx],
                                status: 'available',
                                course: undefined,
                                trainer: undefined,
                                intake: undefined,
                                topic: undefined
                              };
                              updateRooms(newRooms);
                              setStatusMessage({ text: "Room data cleared.", type: 'success' });
                            } else {
                              updateRooms(rooms.filter(r => r.id !== room.id));
                            }
                          }}
                          className="text-red-500 p-2 hover:bg-red-50 rounded-lg"
                          title={isCoreRoom ? "Clear Room Data" : "Delete Room"}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} className="text-eqc-green" /> Add New Event</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData.entries());
                    updateEvents(data, 'update_single');
                    e.currentTarget.reset();
                    setStatusMessage({ text: "Event scheduled!", type: 'success' });
                  }}
                  className="grid grid-cols-2 gap-6"
                >
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Event Title</label>
                    <input name="title" required className="w-full p-3 border rounded-lg" placeholder="e.g. Graduation Ceremony" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Date</label>
                    <input name="date" type="date" required className="w-full p-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Icon (Lucide Name)</label>
                    <input name="icon" className="w-full p-3 border rounded-lg" placeholder="e.g. GraduationCap, Users, Star" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">Description</label>
                    <textarea name="description" required className="w-full p-3 border rounded-lg h-24" placeholder="Brief details about the event..." />
                  </div>
                  <button type="submit" className="col-span-2 bg-eqc-green text-white py-4 rounded-xl font-bold hover:bg-eqc-green/90 transition-all shadow-lg">
                    Schedule Event
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Calendar size={24} className="text-eqc-green" /> Scheduled Events</h3>
                <div className="grid grid-cols-1 gap-4">
                  {events.map(event => (
                    <div key={event.id} className="bg-white p-6 rounded-xl border flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Clock size={24} className="text-eqc-muted" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{event.title}</p>
                          <p className="text-sm text-eqc-green font-bold">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateEvents(event, 'delete')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} className="text-eqc-green" /> Create Announcement</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const text = formData.get('text') as string;
                    const color = formData.get('color') as string;
                    const duration = parseInt(formData.get('duration') as string);
                    updateAnnouncements({ text, color, duration }, 'add');
                    e.currentTarget.reset();
                    setStatusMessage({ text: "Announcement created!", type: 'success' });
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold mb-1">Announcement Text</label>
                    <input name="text" required className="w-full p-3 border rounded-lg" placeholder="e.g. Campus closed this Friday for public holiday" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-1">Banner Color</label>
                      <select name="color" className="w-full p-3 border rounded-lg">
                        <option value="bg-eqc-green">EQC Green</option>
                        <option value="bg-red-600">Urgent Red</option>
                        <option value="bg-blue-600">Info Blue</option>
                        <option value="bg-orange-500">Warning Orange</option>
                        <option value="bg-purple-600">Special Purple</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Duration (Days)</label>
                      <input name="duration" type="number" min="1" max="30" defaultValue="1" className="w-full p-3 border rounded-lg" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-eqc-green text-white py-4 rounded-xl font-bold hover:bg-eqc-green/90 transition-all shadow-lg">
                    Post Announcement
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Megaphone size={24} className="text-eqc-green" /> Active Announcements</h3>
                <div className="grid grid-cols-1 gap-4">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-white p-6 rounded-xl border flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${ann.color}`}></div>
                        <div>
                          <p className="font-bold">{ann.text}</p>
                          <p className="text-xs text-eqc-muted">Expires: {new Date(ann.expiresAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <button onClick={() => updateAnnouncements(ann, 'delete')} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-between items-center shrink-0">
          <a href="/trainer-sign-on.html" target="_blank" className="flex items-center gap-2 text-eqc-green bg-eqc-green/10 px-4 py-2 rounded-lg font-bold hover:bg-eqc-green/20 transition-colors">
            <User size={18} /> Trainer Sign-On Portal
          </a>
        </div>
      </div>
    </div >
  );
};

const CampusMap = () => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg flex-[1.2] flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <MapPin size={24} className="text-eqc-green" />
        <h2 className="text-2xl font-bold serif">Campus & Nearby</h2>
      </div>
      {/*CAMPUS MAP */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 shadow-inner">
          <iframe
            title="Campus Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src="https://maps.google.com/maps?q=2%20Gordon%20St,%20West%20Perth%20WA%206005&t=&z=16&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-eqc-green mb-1.5 flex items-center gap-1">
              <Coffee size={10} /> Cafes & Shopping
            </h3>
            <ul className="text-[10px] space-y-0.5 font-medium">
              <li className="flex justify-between"><span>Gordon St Garage</span> <span className="text-eqc-muted">1m</span></li>
              <li className="flex justify-between"><span>Pony Express</span> <span className="text-eqc-muted">3m</span></li>
              <li className="flex justify-between"><span>Watertown Outlets</span> <span className="text-eqc-muted">5m</span></li>
            </ul>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1.5 flex items-center gap-1">
              <Train size={10} /> Public Transport
            </h3>
            <ul className="text-[10px] space-y-0.5 font-medium">
              <li className="flex justify-between"><span>City West Station</span> <span className="text-eqc-muted">4m</span></li>
              <li className="flex justify-between"><span>Bus 81, 82, 83, 84</span> <span className="text-eqc-muted">2m</span></li>
              <li className="flex justify-between"><span>Yellow CAT Bus</span> <span className="text-eqc-muted">3m</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = ({ onStaffLogin }: { onStaffLogin: () => void }) => {
  return (
    <footer className="bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center text-xs text-eqc-muted shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-red-500" />
          <span className="font-medium">2 Gordon St, West Perth WA 6005</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-eqc-green" />
          <span className="font-medium">1800 338 883</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-eqc-green" />
          <span className="font-medium">hello@equinimcollege.com</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-orange-500" />
          <span className="font-medium">Fire Assembly: Coolgardie St</span>
        </div>
        <div className="flex items-center gap-2">
          <BriefcaseMedical size={14} className="text-red-500" />
          <span className="font-medium">First Aid: Reception</span>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="font-bold tracking-wide">
          RTO 45758 · CRICOS 03952E
        </div>
        <button
          onClick={onStaffLogin}
          className="bg-eqc-green text-white px-2 py-2 rounded-full text-md font-light hover:bg-eqc-green/90 active:scale-95 transition-colors"
        ><CogIcon size={25} />
        </button>
      </div>
    </footer>
  );
};

const AnnouncementBanner = ({ announcements }: { announcements: Announcement[] }) => {
  if (announcements.length === 0) return null;

  return (
    <div className="bg-eqc-green text-white overflow-hidden py-2 shrink-0 relative z-[60] border-b border-white/10">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-20">
        {announcements.map((ann, idx) => (
          <div key={`${ann.id}-${idx}`} className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${ann.color} border border-white/20 shadow-sm`}></div>
            <span className="text-lg font-black uppercase tracking-[0.2em] italic">{ann.text}</span>
            <div className={`w-2 h-2 rounded-full ${ann.color} border border-white/20 shadow-sm`}></div>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {announcements.map((ann, idx) => (
          <div key={`${ann.id}-dup-${idx}`} className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${ann.color} border border-white/20 shadow-sm`}></div>
            <span className="text-lg font-black uppercase tracking-[0.2em] italic">{ann.text}</span>
            <div className={`w-2 h-2 rounded-full ${ann.color} border border-white/20 shadow-sm`}></div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

const FloorPlan = () => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg flex flex-col overflow-hidden h-full">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="w-10 h-10 flex items-center justify-center">
          <MapPinCheckInside size={30} className="text-eqc-green" />
        </div>
        <h2 className="text-2xl font-bold serif">Campus Map</h2>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative flex items-center justify-center">
        <img
          src="/images/eqc-perth-floorplan-1280x.png"
          alt="Campus Floor Plan"
          className="w-full h-full object-contain p-2"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-white shadow-sm">
            <span className="text-xs font-bold text-eqc-text uppercase tracking-widest">Level 1 - West Perth</span>
          </div>
        </div>
      </div>
    </div >
  );
};

export default function App() {
  const [rooms, setRooms] = useState<RoomAllocation[]>(INITIAL_ROOMS);
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [timesheet, setTimesheet] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const socket = io();

    socket.on("rooms_updated", (updatedRooms: RoomAllocation[]) => {
      setRooms(updatedRooms);
    });

    socket.on("events_updated", (updatedEvents: Event[]) => {
      setEvents(updatedEvents);
    });

    socket.on("staff_updated", (updatedStaff: StaffMember[]) => {
      setStaff(updatedStaff);
    });

    socket.on("announcements_updated", (updatedAnnouncements: Announcement[]) => {
      setAnnouncements(updatedAnnouncements);
    });

    socket.on("timesheet_updated", (updatedTimesheet: any[]) => {
      setTimesheet(updatedTimesheet);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden bg-eqc-bg relative">
      <AnimatePresence>
        {showAdmin && (
          <AdminHub
            rooms={rooms}
            events={events}
            staff={staff}
            announcements={announcements}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </AnimatePresence>

      <AnnouncementBanner announcements={announcements} />

      {/* Fullscreen Toggle for Samsung Frame Setup */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition-all opacity-0 hover:opacity-100"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </button>

      <Header />

      <main className="flex-1 flex flex-col p-6 overflow-hidden gap-6">
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Column: Floorplan & Upcoming Events */}
          <div className="w-1/4 shrink-0 flex flex-col overflow-hidden gap-6">
            {/* Spacer to align with Room 1 tile top (Title height + margin) */}
            <div className="h-8 mb-4 shrink-0" />
            <div className="flex-[3] overflow-hidden">
              <FloorPlan />
            </div>
            <div className="flex-[2] overflow-hidden">
              <EventList events={events} />
            </div>
          </div>

          {/* Center Column: Room Allocations */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 h-8 mb-4 shrink-0">
              <div className="w-2.5 h-2.5 bg-eqc-green rounded-full shadow-[0_0_15px_rgba(26,122,84,0.8)] animate-pulse"></div>
              <h2 className="text-2xl font-bold serif text-white">Today's Room Allocations</h2>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              {rooms.map((room) => (
                <RoomItem key={room.id} room={room} />
              ))}
            </div>
          </div>

          {/* Right Column: Widgets */}
          <div className="w-1/4 flex flex-col shrink-0 overflow-hidden">
            {/* Spacer to align with Room 1 tile top */}
            <div className="h-8 mb-4 shrink-0" />
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <WeatherWidget />
              <CampusMap />
            </div>
          </div>
        </div>

        {/* Bottom Row: Info Tiles */}
        <div className="grid grid-cols-4 gap-6 shrink-0 h-32">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-5">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-2 shrink-0 border border-gray-100">
              <QRCodeSVG value="https://study.equinimcollege.com" size={80} />
            </div>
            <div>
              <h3 className="text-2xl font-bold serif mb-0.5">Study Hub</h3>
              <p className="text-xs text-eqc-green font-black tracking-tight">study.equinimcollege.com</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-5">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-2 shrink-0 border border-gray-100">
              <QRCodeSVG value="WIFI:S:EQC-network;T:WPA;P:Equ1n1m6005;;" size={80} />
            </div>
            <div>
              <h3 className="text-2xl font-bold serif mb-0.5">Campus WiFi</h3>
              <p className="text-xs text-eqc-green font-black tracking-tight">EQC-network</p>
              <p className="text-[10px] text-eqc-muted mt-0.5 font-black">PW: Equ1n1m6005</p>
            </div>
          </div>

          <a
            href="https://equinimcollege.com/courses/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-eqc-green p-5 rounded-3xl shadow-xl flex items-center gap-5 text-white hover:bg-eqc-green/90 transition-all border border-white/10"
          >
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center p-2 shrink-0 border border-white/20">
              <QRCodeSVG value="https://equinimcollege.com/courses/" size={80} fgColor="#ffffff" bgColor="transparent" />
            </div>
            <div>
              <h3 className="text-2xl font-bold serif mb-0.5">Our Courses</h3>
              <p className="text-xs opacity-90 font-black tracking-tight">Scan to explore</p>
            </div>
          </a>

          <a
            href="https://www.instagram.com/eqcinstitute/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-5 hover:bg-gray-50 transition-all"
          >
            <div className="w-24 h-24 bg-pink-50 rounded-2xl flex items-center justify-center shrink-0 border border-pink-100">
              <Instagram size={40} className="text-pink-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold serif mb-0.5">Instagram</h3>
              <p className="text-xs text-eqc-muted font-black tracking-tight">@eqcinstitute</p>
            </div>
          </a>
        </div>
      </main>

      <Footer onStaffLogin={() => setShowAdmin(true)} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Samsung Frame Optimization */
        @media (min-aspect-ratio: 16/9) {
          main, header, footer {
            padding-left: 5vw !important;
            padding-right: 5vw !important;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
