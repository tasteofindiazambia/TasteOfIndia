import React, { useState, useCallback } from 'react';
import { X, Upload, Download, FileText, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (data: any[]) => void;
}

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string;
  vegetarian: boolean;
  spiceLevel: string;
  pieces: number;
  imageUrl: string;
  available: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<MenuItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [columnMapping, setColumnMapping] = useState<{[key: string]: string}>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // CSV Template structure - Updated to match your file format
  const csvTemplate = [
    {
      Name: 'Pani Puri',
      Description: 'Crispy puris filled with spicy, tangy water and chutneys along with dry puris',
      Price: 60,
      Category: 'food',
      Tags: 'Crunchy,Tangy,Spicy,Sharable,Popular,Vegetarian',
      Available: 'TRUE',
      Vegetarian: 'TRUE',
      ImageUrl: '',
      spiceLevel: '1',
      pieces: '1'
    },
    {
      Name: 'Chicken Biryani',
      Description: 'Aromatic basmati rice with tender chicken and spices',
      Price: 25.00,
      Category: 'Main Course',
      Tags: 'North Indian,Non-Vegetarian',
      Available: 'TRUE',
      Vegetarian: 'FALSE',
      ImageUrl: 'https://example.com/chicken-biryani.jpg',
      spiceLevel: '2',
      pieces: '1'
    }
  ];

  const requiredFields = [
    'name', 'description', 'price', 'category', 'tags', 
    'vegetarian', 'spiceLevel', 'pieces', 'imageUrl', 'available'
  ];

  const fieldLabels = {
    name: 'Item Name',
    description: 'Description',
    price: 'Price',
    category: 'Category',
    tags: 'Tags',
    vegetarian: 'Vegetarian',
    spiceLevel: 'Spice Level',
    pieces: 'Pieces/Serving',
    imageUrl: 'Image URL',
    available: 'Available'
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      showNotification({
        type: 'error',
        message: 'Please upload a CSV file'
      });
      return;
    }

    setFile(uploadedFile);
    parseCSV(uploadedFile);
  }, [showNotification]);

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
      
      // Find the header row (look for common header patterns)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        const line = lines[i].toLowerCase();
        if (line.includes('name') && line.includes('description') && line.includes('price')) {
          headerRowIndex = i;
          break;
        }
      }
      
      const headers = lines[headerRowIndex].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Auto-map columns - Enhanced to handle your CSV format
      const mapping: {[key: string]: string} = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase().trim();
        
        // Direct matches for your CSV format
        if (lowerHeader === 'name') {
          mapping[header] = 'name';
        } else if (lowerHeader === 'description') {
          mapping[header] = 'description';
        } else if (lowerHeader === 'price') {
          mapping[header] = 'price';
        } else if (lowerHeader === 'category') {
          mapping[header] = 'category';
        } else if (lowerHeader === 'tags') {
          mapping[header] = 'tags';
        } else if (lowerHeader === 'available') {
          mapping[header] = 'available';
        } else if (lowerHeader === 'vegetarian') {
          mapping[header] = 'vegetarian';
        } else if (lowerHeader === 'imageurl') {
          mapping[header] = 'imageUrl';
        } else if (lowerHeader === 'spicelevel') {
          mapping[header] = 'spiceLevel';
        } else if (lowerHeader === 'pieces') {
          mapping[header] = 'pieces';
        }
        // Fallback fuzzy matching
        else if (lowerHeader.includes('name') || lowerHeader.includes('item')) {
          mapping[header] = 'name';
        } else if (lowerHeader.includes('description') || lowerHeader.includes('desc')) {
          mapping[header] = 'description';
        } else if (lowerHeader.includes('price') || lowerHeader.includes('cost')) {
          mapping[header] = 'price';
        } else if (lowerHeader.includes('category') || lowerHeader.includes('cat')) {
          mapping[header] = 'category';
        } else if (lowerHeader.includes('tag')) {
          mapping[header] = 'tags';
        } else if (lowerHeader.includes('vegetarian') || lowerHeader.includes('veg')) {
          mapping[header] = 'vegetarian';
        } else if (lowerHeader.includes('spice') || lowerHeader.includes('hot')) {
          mapping[header] = 'spiceLevel';
        } else if (lowerHeader.includes('piece') || lowerHeader.includes('serving')) {
          mapping[header] = 'pieces';
        } else if (lowerHeader.includes('image') || lowerHeader.includes('photo')) {
          mapping[header] = 'imageUrl';
        } else if (lowerHeader.includes('available') || lowerHeader.includes('active')) {
          mapping[header] = 'available';
        }
      });

      setColumnMapping(mapping);

      // Parse data starting from the row after headers
      const data: any[] = [];
      for (let i = headerRowIndex + 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            if (mapping[header]) {
              row[mapping[header]] = values[index] || '';
            }
          });
          data.push(row);
        }
      }

      setPreviewData(data);
      setStep(2);
    };
    reader.readAsText(file);
  };

  const validateData = (data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because CSV starts from row 2 (after header)
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push({
            row: rowNum,
            field,
            message: `${fieldLabels[field as keyof typeof fieldLabels]} is required`
          });
        }
      });

      // Validate price
      if (row.price && (isNaN(parseFloat(row.price)) || parseFloat(row.price) < 0)) {
        errors.push({
          row: rowNum,
          field: 'price',
          message: 'Price must be a valid positive number'
        });
      }

      // Validate pieces
      if (row.pieces && (isNaN(parseInt(row.pieces)) || parseInt(row.pieces) < 1)) {
        errors.push({
          row: rowNum,
          field: 'pieces',
          message: 'Pieces must be a valid positive integer'
        });
      }

      // Validate vegetarian
      if (row.vegetarian && !['true', 'false', 'yes', 'no', '1', '0', 'true', 'false'].includes(row.vegetarian.toLowerCase())) {
        errors.push({
          row: rowNum,
          field: 'vegetarian',
          message: 'Vegetarian must be TRUE/FALSE, true/false, yes/no, or 1/0'
        });
      }

      // Validate spice level
      if (row.spiceLevel && !['Mild', 'Medium', 'Hot', 'Extra Hot'].includes(row.spiceLevel)) {
        errors.push({
          row: rowNum,
          field: 'spiceLevel',
          message: 'Spice level must be: Mild, Medium, Hot, or Extra Hot'
        });
      }

      // Validate available
      if (row.available && !['true', 'false', 'yes', 'no', '1', '0', 'true', 'false'].includes(row.available.toLowerCase())) {
        errors.push({
          row: rowNum,
          field: 'available',
          message: 'Available must be TRUE/FALSE, true/false, yes/no, or 1/0'
        });
      }
    });

    return errors;
  };

  const handlePreview = () => {
    const errors = validateData(previewData);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      // Transform data to proper format
      const transformedData = previewData.map(row => ({
        name: row.name?.toString().trim(),
        description: row.description?.toString().trim(),
        price: parseFloat(row.price) || 0,
        category: row.category?.toString().trim(),
        tags: row.tags?.toString().trim(),
        vegetarian: ['true', 'yes', '1', 'true'].includes(row.vegetarian?.toString().toLowerCase()),
        spiceLevel: row.spiceLevel?.toString().trim(),
        pieces: parseInt(row.pieces) || 1,
        imageUrl: row.imageUrl?.toString().trim(),
        available: ['true', 'yes', '1', 'true'].includes(row.available?.toString().toLowerCase())
      }));
      
      setCsvData(transformedData);
      setStep(3);
    } else {
      showNotification({
        type: 'error',
        message: `Found ${errors.length} validation errors. Please fix them before proceeding.`
      });
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUploadComplete(csvData);
      showNotification({
        type: 'success',
        message: `Successfully uploaded ${csvData.length} menu items!`
      });
      
      // Reset form
      setStep(1);
      setFile(null);
      setCsvData([]);
      setValidationErrors([]);
      setColumnMapping({});
      setPreviewData([]);
      onClose();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to upload menu items'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Use the exact format from your CSV file
    const headers = ['Name', 'Description', 'Price', 'Category', 'Tags', 'Available', 'Vegetarian', 'ImageUrl', 'spiceLevel', 'pieces'];
    const csvContent = [
      headers.join(','),
      ...csvTemplate.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Menu from CSV</h2>
              <p className="text-gray-600">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? 'bg-deep-maroon text-light-cream' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > stepNumber ? 'bg-deep-maroon' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-16 h-16 text-deep-maroon mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload CSV File</h3>
                <p className="text-gray-600 mb-6">
                  Upload a CSV file with your menu items. The system will automatically detect and map your columns.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">✨ Smart CSV Import</h4>
                  <p className="text-blue-700 text-sm">
                    Our system automatically detects your CSV format and maps columns intelligently. 
                    It works with various formats including your existing menu data structure.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-6 py-3 border border-deep-maroon text-deep-maroon rounded-lg hover:bg-deep-maroon hover:text-light-cream transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  
                  <label className="flex items-center gap-2 px-6 py-3 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Choose CSV File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Template Preview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">CSV Template Structure</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-200">
                        {['Name', 'Description', 'Price', 'Category', 'Tags', 'Available', 'Vegetarian', 'ImageUrl', 'spiceLevel', 'pieces'].map(header => (
                          <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvTemplate.slice(0, 2).map((row, index) => (
                        <tr key={index} className="border-t">
                          {['Name', 'Description', 'Price', 'Category', 'Tags', 'Available', 'Vegetarian', 'ImageUrl', 'spiceLevel', 'pieces'].map(header => (
                            <td key={header} className="px-3 py-2 text-gray-600">
                              {row[header as keyof typeof row]?.toString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping & Preview */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-deep-maroon" />
                <h3 className="text-xl font-semibold text-gray-900">Column Mapping & Preview</h3>
              </div>

              {/* Column Mapping */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Column Mapping</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(columnMapping).map(([csvColumn, mappedField]) => (
                    <div key={csvColumn} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-32 truncate">
                        {csvColumn}
                      </span>
                      <span className="text-gray-400">→</span>
                      <select
                        value={mappedField}
                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [csvColumn]: e.target.value }))}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-deep-maroon"
                      >
                        <option value="">Select field...</option>
                        {requiredFields.map(field => (
                          <option key={field} value={field}>
                            {fieldLabels[field as keyof typeof fieldLabels]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Data Preview (First 5 rows)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        {Object.values(columnMapping).filter(Boolean).map(field => (
                          <th key={field} className="px-3 py-2 text-left font-medium text-gray-700">
                            {fieldLabels[field as keyof typeof fieldLabels]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.entries(columnMapping).map(([csvColumn, mappedField]) => (
                            mappedField && (
                              <td key={csvColumn} className="px-3 py-2 text-gray-600">
                                {row[mappedField]?.toString()}
                              </td>
                            )
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">Validation Errors</h4>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Final Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Final Review</h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Ready to Import</span>
                </div>
                <p className="text-green-700">
                  {csvData.length} menu items validated and ready for import.
                </p>
              </div>

              {/* Final Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Menu Items to Import</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {csvData.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-600">{item.category} • ${item.price}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{item.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                        <p>{item.spiceLevel} • {item.pieces} pieces</p>
                      </div>
                    </div>
                  ))}
                  {csvData.length > 10 && (
                    <p className="text-center text-gray-500 text-sm">
                      ... and {csvData.length - 10} more items
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </button>
            
            {step === 2 && (
              <button
                onClick={handlePreview}
                className="px-6 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy"
              >
                Validate & Preview
              </button>
            )}
            
            {step === 3 && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-6 py-2 bg-deep-maroon text-light-cream rounded-lg hover:bg-burgundy disabled:opacity-50"
              >
                {loading ? 'Importing...' : `Import ${csvData.length} Items`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
