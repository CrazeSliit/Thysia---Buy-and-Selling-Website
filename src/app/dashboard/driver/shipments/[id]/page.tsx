import React from 'react';

export default function ShipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shipment Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Shipment ID: {params.id}</p>
        <p className="text-gray-600">Shipment details functionality coming soon...</p>
      </div>
    </div>
  );
}
