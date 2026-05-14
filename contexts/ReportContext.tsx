import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserReport {
    id: string;
    animalType: 'dog' | 'cat';
    breed: string;
    color: string;
    status: 'pending' | 'verified' | 'resolved' | 'atRisk';
    date: string;
    location: string;
    imageUri: string | null;
    aiData?: any;
}

interface ReportContextType {
    reports: UserReport[];
    addReport: (report: Omit<UserReport, 'id' | 'date' | 'status'>) => void;
    updateReportStatus: (id: string, status: UserReport['status']) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReports = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReports must be used within a ReportProvider');
    }
    return context;
};

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reports, setReports] = useState<UserReport[]>([
        // Initial mock data
        {
            id: '1',
            animalType: 'dog',
            breed: 'Labrador Mix',
            color: 'Golden Brown',
            status: 'verified',
            date: 'Jan 24, 2026',
            location: 'Marina Bay Sands',
            imageUri: null,
        },
        {
            id: '2',
            animalType: 'cat',
            breed: 'Tabby',
            color: 'Orange',
            status: 'resolved',
            date: 'Jan 23, 2026',
            location: 'Orchard Road',
            imageUri: null,
        },
    ]);

    const addReport = (reportData: Omit<UserReport, 'id' | 'date' | 'status'>) => {
        const newReport: UserReport = {
            ...reportData,
            id: `report-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'pending',
        };
        setReports(prev => [newReport, ...prev]);
    };

    const updateReportStatus = (id: string, status: UserReport['status']) => {
        setReports(prev =>
            prev.map(report =>
                report.id === id ? { ...report, status } : report
            )
        );
    };

    return (
        <ReportContext.Provider value={{ reports, addReport, updateReportStatus }}>
            {children}
        </ReportContext.Provider>
    );
};
