import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    message?: string;
    icon?: React.ReactNode;
    colSpan?: number;
}

const EmptyState = ({ message = "Tidak ada data", icon, colSpan }: EmptyStateProps) => {
    const content = (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            {icon || <Inbox className="w-12 h-12 mb-3" />}
            <p className="text-sm">{message}</p>
        </div>
    );

    if (colSpan) {
        return (
            <tr>
                <td colSpan={colSpan}>{content}</td>
            </tr>
        );
    }

    return content;
};

export default EmptyState;
