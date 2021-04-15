import React from 'react'

export default function Footer() {
    return (
        <div>
            <footer className="bg-dark text-white mt-5 text-center">
                Copyright &copy; {new Date().getFullYear()} Dev Connector
            </footer>
        </div>
    )
}
