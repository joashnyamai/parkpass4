/**
 * DIGITAL PARKING PERMIT DISPLAY COMPONENT
 * Shows generated parking permit with QR code
 */

import React from 'react';
import { CheckCircle, Calendar, Clock, Car, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PermitDisplay = ({ permit }) => {
  if (!permit) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-KE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .permit-container, .permit-container * {
            visibility: visible;
          }
          .permit-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
      
      <div className="permit-container bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Digital Parking Permit</h2>
          <p className="text-sm text-gray-600 mt-1">Your parking is confirmed</p>
        </div>

      <div className="border-t border-b border-gray-200 py-3 mb-3">
        <div className="text-center mb-3">
          <p className="text-xs text-gray-600">Permit ID</p>
          <p className="text-base font-mono font-bold text-gray-900">{permit.permitId}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-white rounded-lg border-2 border-gray-200">
            <QRCodeSVG
              value={JSON.stringify({
                permitId: permit.permitId,
                parkingSpace: permit.parkingSpaceName,
                validFrom: permit.validFrom,
                validUntil: permit.validUntil,
                vehicleInfo: permit.vehicleInfo,
                userId: permit.userId
              })}
              size={160}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563EB'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3Cpath fill='white' d='M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'/%3E%3C/svg%3E",
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 mb-2">
          Scan this QR code at the parking entrance
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-start">
          <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-xs text-gray-600">Parking Location</p>
            <p className="text-sm font-semibold text-gray-900">{permit.parkingSpaceName}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-xs text-gray-600">Valid From</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(permit.validFrom)}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Clock className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-xs text-gray-600">Valid Until</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(permit.validUntil)}</p>
          </div>
        </div>

        {permit.vehicleInfo && (
          <div className="flex items-start">
            <Car className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Vehicle</p>
              <p className="text-sm font-semibold text-gray-900">{permit.vehicleInfo}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Total Paid:</strong> KES {permit.totalPrice}
        </p>
      </div>

      <div className="mt-3 text-center no-print">
        <button
          onClick={() => window.print()}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          🖨️ Print Permit
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          Keep this permit visible in your vehicle at all times
        </p>
      </div>
    </div>
    </>
  );
};

export default PermitDisplay;
