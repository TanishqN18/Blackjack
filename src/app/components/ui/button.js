export default function Button({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-md shadow transition-transform hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );
}
