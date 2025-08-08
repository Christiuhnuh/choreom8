import React, { useState } from 'react';
import routes from '../routes/routes';
import { Link } from 'react-router-dom';


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold">ChoreoM8</div>

            <ul className="hidden md:flex space-x-6">
                {routes.map(({ path, name }) => (
                    <li key={path}>
                        <Link to={path} className="hover:text-teal-400">{name}</Link>
                    </li>
                ))}
            </ul>

            <button id="menu-btn"
                className="md:hidden text-2xl focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                &#9776;
            </button>

            {isOpen && (
                <ul className="absolute top-16 left-0 w-full bg-gray-800 px-6 py-4 flex flex-col space-y-2 md:hidden z-10">
                    <li><a href="uploads.html" className="hover:text-teal-400">Uploads</a></li>
                    <li><a href="drafts.html" className="hover:text-teal-400">Drafts</a></li>
                </ul>
            )}
        </nav>
    )
}