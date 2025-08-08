export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Test Page Working</h1>
        <p className="text-gray-600">
          If you can see this page, the basic Next.js setup is working correctly.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p>• Next.js: ✅ Working</p>
          <p>• Tailwind CSS: ✅ Working</p>
          <p>• Routing: ✅ Working</p>
        </div>
      </div>
    </div>
  );
}
