import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Button from '../common/Button';
import { FileDown, FileSpreadsheet, Download, Mail, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportGeneration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGenerate = () => {
    toast.success('Report generated successfully!');
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Report Generation" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-secondary-900">Generate Report</h1>
              <p className="text-secondary-500">Create custom reports for community planning.</p>
            </div>

            <div className="card mb-6">
              <h3 className="font-display font-semibold text-secondary-900 mb-4">Report Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <select className="input-field"><option>Last 30 days</option></select>
                <select className="input-field"><option>All Areas</option></select>
                <select className="input-field"><option>All Types</option></select>
                <select className="input-field"><option>PDF</option></select>
              </div>
              <Button variant="primary" icon={Filter} onClick={handleGenerate}>
                Generate Report
              </Button>
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-secondary-900 mb-4">Quick Export</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" icon={FileDown}>PDF</Button>
                <Button variant="secondary" icon={FileSpreadsheet}>CSV</Button>
                <Button variant="secondary" icon={Download}>Excel</Button>
                <Button variant="secondary" icon={Mail}>Email</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportGeneration;