import { Link } from 'react-router-dom';
import { Home, Search, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="not-found-animate mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 mb-6">
            <AlertCircle className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold text-dark-900 mb-2">404</h1>
          <p className="text-xl text-dark-500">Page Not Found</p>
        </div>
        <p className="not-found-animate text-dark-600 mb-8 max-w-sm mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="not-found-animate flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          <Link to="/members" className="btn-secondary">
            <Search className="w-4 h-4 mr-2" />
            Browse Members
          </Link>
        </div>
      </div>
    </div>
  );
}