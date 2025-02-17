'use client';

import React, { useState } from 'react';
import { PlusCircle, Download, Save, Trash2, Edit } from 'lucide-react';

const EstateplannerApp = () => {
  const [items, setItems] = useState([]);
  const [userName, setUserName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    description: '',
    value: '',
    recipient: '',
    notes: '',
    photos: [],
    currentPhotoUrl: ''
  });

  // Format number with commas and decimal points
  const formatNumberWithCommas = (value) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    const wholePart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';
    const wholeWithCommas = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return wholeWithCommas + decimalPart;
  };

  const handleAddItem = () => {
    if (currentItem.description && currentItem.value) {
      const photos = currentItem.currentPhotoUrl 
        ? [...currentItem.photos, currentItem.currentPhotoUrl]
        : currentItem.photos;
        
      const cleanValue = currentItem.value.replace(/,/g, '');
      
      if (editingId) {
        setItems(items.map(item => 
          item.id === editingId ? 
          { ...item, ...currentItem, value: cleanValue, photos } : 
          item
        ));
        setEditingId(null);
      } else {
        setItems([...items, { 
          ...currentItem, 
          id: Date.now(),
          value: cleanValue,
          photos,
          dateAdded: new Date().toLocaleDateString() 
        }]);
      }
      setCurrentItem({
        description: '',
        value: '',
        recipient: '',
        notes: '',
        photos: [],
        currentPhotoUrl: ''
      });
      setShowForm(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem({
      ...item,
      value: formatNumberWithCommas(item.value)
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const exportToCSV = () => {
    try {
      const csvRows = [
        ['Description', 'Value ($)', 'Recipient', 'Notes', 'Date Added', 'Photo URLs'],
        ...items.map(item => [
          item.description,
          item.value.replace(/,/g, ''),
          item.recipient,
          item.notes,
          item.dateAdded,
          item.photos.join(' ; ')
        ])
      ];

      const processedRows = csvRows.map(row =>
        row.map(field => {
          const stringField = String(field || '');
          if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        }).join(',')
      );

      const csvContent = processedRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `estate-inventory-${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('There was an error exporting your data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-8">Estate Inventory Planner</h1>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-md text-base"
            />
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </button>

          {showForm && (
            <div className="bg-white border rounded-lg p-6 mb-8">
              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Description</label>
                  <input
                    placeholder="Enter item description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-md text-base"
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value ($)</label>
                  <input
                    type="text"
                    placeholder="Enter value (e.g., 1,000.00)"
                    value={currentItem.value}
                    onChange={(e) => {
                      const formattedValue = formatNumberWithCommas(e.target.value);
                      setCurrentItem({...currentItem, value: formattedValue});
                    }}
                    className="w-full px-4 py-2 border rounded-md text-base"
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intended Recipient</label>
                  <input
                    placeholder="Enter recipient's name"
                    value={currentItem.recipient}
                    onChange={(e) => setCurrentItem({...currentItem, recipient: e.target.value})}
                    className="w-full px-4 py-2 border rounded-md text-base"
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    placeholder="Enter any additional notes about the item"
                    value={currentItem.notes}
                    onChange={(e) => setCurrentItem({...currentItem, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md text-base resize-y"
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo Link</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Enter photo URL (e.g., from Google Drive, Dropbox)"
                      value={currentItem.currentPhotoUrl || ''}
                      onChange={(e) => setCurrentItem({
                        ...currentItem,
                        currentPhotoUrl: e.target.value
                      })}
                      className="flex-1 px-4 py-2 border rounded-md text-base"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (currentItem.currentPhotoUrl) {
                          setCurrentItem({
                            ...currentItem,
                            photos: [...currentItem.photos, currentItem.currentPhotoUrl],
                            currentPhotoUrl: ''
                          });
                        }
                      }}
                      disabled={!currentItem.currentPhotoUrl}
                      className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {currentItem.photos.length > 0 && (
                  <div className="mt-4 border rounded-md p-4 bg-gray-50">
                    <div className="text-sm font-medium text-gray-700 mb-3">Added Photo Links:</div>
                    <div className="space-y-2">
                      {currentItem.photos.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded border bg-white">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate flex-1 text-sm"
                          >
                            {url}
                          </a>
                          <button
                            onClick={() => {
                              setCurrentItem({
                                ...currentItem,
                                photos: currentItem.photos.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:bg-red-50 p-2 rounded ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={handleAddItem}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Update Item' : 'Save Item'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setCurrentItem({
                        description: '',
                        value: '',
                        recipient: '',
                        notes: '',
                        photos: [],
                        currentPhotoUrl: ''
                      });
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.description}</h3>
                            {item.photos.length > 0 && (
                              <span className="text-xs text-gray-500">
                                ({item.photos.length} photo{item.photos.length !== 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">Value: ${formatNumberWithCommas(item.value)}</p>
                        <p className="text-sm text-gray-600">Recipient: {item.recipient}</p>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                        )}
                        {item.photos.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">Photo Links:</div>
                            <div className="mt-1 space-y-1">
                              {item.photos.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-600 hover:underline"
                                >
                                  {url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Added: {item.dateAdded}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={exportToCSV} 
                className="mt-6 px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstateplannerApp;
