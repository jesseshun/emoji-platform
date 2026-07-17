interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-content w-full px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
