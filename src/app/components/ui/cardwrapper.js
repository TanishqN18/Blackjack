export default function CardWrapper({ title, children }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
