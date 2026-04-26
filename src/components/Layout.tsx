import { Outlet } from 'react-router-dom';
import Header from './Header';
import ChatBot from './ChatBot';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-maroon-dark text-white py-12 px-4 shadow-inner mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-display text-gold mb-4">विवाह सेतू</h3>
            <p className="text-gray-300">
               Exclusively for the Digambar Jain community. Connecting souls with traditional values and modern technology.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-display text-gold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
              <li>About Us</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-display text-gold mb-4">Contact</h3>
            <p className="text-gray-400">Email: support@vivahsetu.com</p>
            <p className="text-gray-400">UPI: vivahsetu@ptaxis</p>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-maroon text-gray-500 text-sm">
          &copy; 2026 Vivah Setu. All Rights Reserved.
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
