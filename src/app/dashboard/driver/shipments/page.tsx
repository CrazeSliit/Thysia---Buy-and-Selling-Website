'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Shipment {
  id: string;
  orderId: string;
  status: string;
  trackingNumber: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    totalAmount: number;
    user: {
      name: string;
      email: string;
    };
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
}

export default function DriverShipmentsPage() {
  const { data: session } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/driver/shipments');
      if (response.ok) {
        const data = await response.json();
        setShipments(data);
      } else {
        toast.error('Failed to load shipments');
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/driver/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          notes,
          actualDelivery: status === 'DELIVERED' ? new Date().toISOString() : undefined
        }),
      });

      if (response.ok) {
        const updatedShipment = await response.json();
        setShipments(shipments.map(s => 
          s.id === shipmentId ? updatedShipment : s
        ));
        toast.success('Shipment status updated');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update shipment');
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.error('Failed to update shipment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
        <p className="text-gray-600">Manage your assigned deliveries</p>
      </div>

      {shipments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No shipments assigned</div>
          <p className="text-gray-400 mt-2">Check back later for new delivery assignments</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shipment #{shipment.trackingNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Order #{shipment.order.id}
                  </p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                  {shipment.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-600">{shipment.order.user.name}</p>
                  <p className="text-sm text-gray-600">{shipment.order.user.email}</p>
                  <p className="text-sm text-gray-600">Amount: ${shipment.order.totalAmount}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600">
                    {shipment.order.shippingAddress.street}<br />
                    {shipment.order.shippingAddress.city}, {shipment.order.shippingAddress.state} {shipment.order.shippingAddress.zipCode}<br />
                    {shipment.order.shippingAddress.country}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Timeline</h4>
                  {shipment.estimatedDelivery && (
                    <p className="text-sm text-gray-600">
                      Estimated: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </p>
                  )}
                  {shipment.actualDelivery && (
                    <p className="text-sm text-gray-600">
                      Delivered: {new Date(shipment.actualDelivery).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">
                    {shipment.notes || 'No notes'}
                  </p>
                </div>
              </div>

              {shipment.status !== 'DELIVERED' && shipment.status !== 'CANCELLED' && (
                <div className="flex space-x-2">
                  {shipment.status === 'PENDING' && (
                    <button
                      onClick={() => updateShipmentStatus(shipment.id, 'IN_TRANSIT')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Start Delivery
                    </button>
                  )}
                  
                  {shipment.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => {
                        const notes = prompt('Add delivery notes (optional):');
                        updateShipmentStatus(shipment.id, 'DELIVERED', notes || undefined);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      Mark as Delivered
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const notes = prompt('Add notes for this shipment:');
                      if (notes) {
                        updateShipmentStatus(shipment.id, shipment.status, notes);
                      }
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                  >
                    Add Notes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
