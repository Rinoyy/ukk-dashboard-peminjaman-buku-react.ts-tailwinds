import { exportService } from '../services/exportService';

type ExportType = 'books' | 'categories' | 'borrowings' | 'returns' | 'users' | 'damaged' | 'visits';

export const useExport = () => {
    const downloadExport = (type: ExportType) => {
        exportService.downloadExport(type);
    };

    return { downloadExport };
};
