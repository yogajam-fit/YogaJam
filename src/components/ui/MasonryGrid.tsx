import React from 'react';

export function MasonryGrid({ items, renderItem }: { items: any[], renderItem: (item: any, index: number) => React.ReactNode }) {
  // We render 3 different layouts for mobile (2 col), tablet (3 col), and desktop (4 col)
  // This avoids hydration mismatch while preserving left-to-right ordering visually.
  
  const renderCols = (cols: number) => {
    const colClass = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4';
    return (
      <div className={`grid ${colClass} gap-3 md:gap-4`}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-3 md:gap-4">
            {items.filter((_, i) => i % cols === colIndex).map((item, originalIndex) => (
              <React.Fragment key={item.id || originalIndex}>
                {renderItem(item, originalIndex)}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile: 2 columns */}
      <div className="block md:hidden">
        {renderCols(2)}
      </div>
      
      {/* Tablet: 3 columns */}
      <div className="hidden md:block lg:hidden">
        {renderCols(3)}
      </div>
      
      {/* Desktop: 4 columns */}
      <div className="hidden lg:block">
        {renderCols(4)}
      </div>
    </>
  );
}
